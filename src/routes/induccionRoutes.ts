import { Router, json } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { enviarCredencialesPorEmail } from '../modules/induccion-temporal/utils/mailer.js';
import { supabase } from '../config/supabaseClient.js';

const router = Router();
router.use(json()); // Ensure body parsing is active for this route group

// Configuración de multer (Memory Storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// En una implementación real, aquí se inyectarían las consultas a la DB.
// Por el momento simularemos las respuestas según el requerimiento.

router.post('/trabajadores', async (req, res) => {
    try {
        const { dni, nombre, apellido, empresa, email, celular } = req.body;

        if (!dni) {
            return res.status(400).json({ error: 'El DNI es requerido' });
        }

        // Generar username y password
        const username = `temp_${dni}`;
        const letras = Math.random().toString(36).substring(2, 6).toUpperCase();
        const safeDni = String(dni);
        const ultimos = safeDni.substring(Math.max(0, safeDni.length - 4));
        const password = `${letras}${ultimos}!`;
        const password_hash = await bcrypt.hash(password, 10);

        // Guardar en DB delegando la petición a Campus_CATH_Backend
        const backendResponse = await fetch('http://localhost:3001/api/users/worker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: username, nombre, apellido, empresa, email, password })
        });

        if (!backendResponse.ok) {
            const errBody = await backendResponse.text();
            throw new Error(`Fallo al crear usuario en BD Central: ${errBody}`);
        }

        // Simulación: Envío de credenciales reales al trabajador
        if (celular) {
            const campusUrl = process.env.VITE_CAMPUS_URL || 'https://plataforma-catalina-campus-cath.c2awqr.easypanel.host';
            console.log(`\n[WHATSAPP-MOCK] Enviando a ${celular}: Hola ${nombre}, fuiste registrado para la Inducción Temporal en Pueba_CATH. Ingresa a ${campusUrl}/login. Usuario: ${username} | Clave: ${password}\n`);
        }
        if (email) {
            // Reemplazando el MOCK por envío real de Nodemailer
            // Hacemos el await o lo enviamos asíncronamente en background
            enviarCredencialesPorEmail(email, nombre, username, password).catch(console.error);
        }

        res.status(201).json({ id: uuidv4(), username, password }); // In real app, don't send raw password back, email it instead
    } catch (error: any) {
        console.error("🔥 Error crítico en induccionRoutes:", error.message, error.stack);
        import('fs').then(fs => fs.writeFileSync('./error-debug.log', error.stack || error.toString()));
        res.status(500).json({ error: 'Error registrando trabajador', detail: error.message });
    }
});

router.post('/trabajadores/masivo', async (req, res) => {
    try {
        const { trabajadores } = req.body;
        // Iterar y crear masivamente
        for (const trab of trabajadores) {
            const username = `temp_${trab.dni}`;
            const letras = Math.random().toString(36).substring(2, 6).toUpperCase();
            const ultimos = (trab.dni || "0000").substring(Math.max(0, (trab.dni || "0000").length - 4));
            const password = `${letras}${ultimos}!`;

            if (trab.celular) {
                console.log(`\n[WHATSAPP-MOCK] Enviando masivo a ${trab.celular}: Usuario: ${username} | Clave: ${password}\n`);
            }
            if (trab.email) {
                enviarCredencialesPorEmail(trab.email, String(trab.nombre), username, password).catch(console.error);
            }
        }
        res.status(201).json({ status: 'ok', count: trabajadores?.length || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error en registro masivo' });
    }
});

router.post('/solicitud', async (req, res) => {
    try {
        const data = req.body;
        const id = uuidv4();
        // Guardar en DB
        res.status(201).json({ id, ...data });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear solicitud' });
    }
});

router.patch('/solicitud/:id/decision', async (req, res) => {
    try {
        const { estado, observaciones } = req.body;
        // Actualizar en DB
        res.status(200).json({ status: 'ok', estado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
});

router.post('/content/upload', upload.single('file'), async (req, res) => {
    try {
        const { titulo, tipo } = req.body;
        const file = req.file;

        if (tipo !== 'texto' && !file) {
            return res.status(400).json({ message: 'Se requiere un archivo para este tipo de contenido' });
        }

        let urlStorage = '';

        if (tipo !== 'texto' && file) {
            const ext = path.extname(file.originalname);
            const fileName = `${uuidv4()}${ext}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('induccion')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                throw new Error('Supabase Error: ' + JSON.stringify(uploadError));
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('induccion')
                .getPublicUrl(fileName);

            urlStorage = publicUrlData.publicUrl;
        }

        // Delegar la creación del contenido en Campus_CATH_Backend (NestJS => Prisma => Supabase)
        const nestResponse = await fetch('http://localhost:3001/api/courses/induction/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, tipo, urlStorage })
        });

        if (!nestResponse.ok) {
            throw new Error('Falló la sincronización con Campus_CATH_Backend');
        }

        const nestData = await nestResponse.json();
        const activity = nestData.activity;

        // Transformar la Activity de Prisma al formato visual que requiere Frontend GestorContenido
        const contenido = {
            id: activity.id,
            titulo: activity.title,
            tipo: tipo, // original uploaded type
            urlStorage: activity.contentUrl,
            orden: activity.sequenceOrder,
            activo: true,
            subidoEn: new Date().toISOString()
        };

        res.status(201).json(contenido);
    } catch (error: any) {
        console.error("Upload error proxy:", error);
        import('fs').then(fs => fs.writeFileSync('./upload-error.log', error.stack || error.toString()));
        res.status(500).json({ message: 'Error al sincronizar archivo con el Campus Virtual', detail: error.message });
    }
});

router.get('/content', async (req, res) => {
    try {
        // Consultar contenido real sincronizado en Campus_CATH_Backend
        const nestResponse = await fetch('http://localhost:3001/api/courses');
        const courses = await nestResponse.json();

        const inductionCourse = courses.find((c: any) => c.courseType === 'InduccionCorta');
        if (!inductionCourse || !inductionCourse.modules.length) {
            return res.status(200).json([]);
        }

        // Extraer y transformar activities del primer módulo para mostrar en GestorContenido
        const activities = inductionCourse.modules[0].activities;
        const mappedContent = activities.map((act: any) => ({
            id: act.id,
            titulo: act.title,
            tipo: act.activityType.toLowerCase() === 'documento' ? 'pdf' : act.activityType.toLowerCase(),
            urlStorage: act.contentUrl,
            orden: act.sequenceOrder,
            activo: true,
            subidoEn: new Date().toISOString()
        }));

        res.status(200).json(mappedContent);
    } catch (error) {
        console.error("GET /content proxy error:", error);
        res.status(500).json({ error: 'Error listando contenido desde Campus Virtual' });
    }
});

router.delete('/content/:id', async (req, res) => {
    try {
        // Eliminar en DB
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando contenido' });
    }
});

router.patch('/content/reorder', async (req, res) => {
    try {
        // Actualizar órdenes en DB
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ error: 'Error reordenando contenido' });
    }
});

router.post('/evaluacion', async (req, res) => {
    try {
        const data = req.body;
        const finalId = uuidv4();
        // Guardar en DB
        res.status(201).json({ id: finalId, ...data });
    } catch (error) {
        res.status(500).json({ error: 'Error registrando evaluación' });
    }
});

router.get('/certificado/:id', async (req, res) => {
    try {
        // MOCK response - en DB deberíamos extraer el join de certificado y usuario
        res.status(200).json({
            id: 'cert-' + req.params.id,
            evaluacionId: req.params.id,
            codigoUnico: 'VERIF-' + uuidv4().substring(0, 8).toUpperCase(),
            emitidoEn: new Date().toISOString(),
            trabajador: {
                nombre: 'Demo',
                apellido: 'Trabajador',
                dni: '12345678'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error generando certificado' });
    }
});

export default router;
