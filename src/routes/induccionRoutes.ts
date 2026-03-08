import { Router, json } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { enviarCredencialesPorEmail } from '../modules/induccion-temporal/utils/mailer.js';

const router = Router();
router.use(json()); // Ensure body parsing is active for this route group

// Configuración de multer (Local Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/induccion');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});
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
            console.log(`\n[WHATSAPP-MOCK] Enviando a ${celular}: Hola ${nombre}, fuiste registrado para la Inducción Temporal en Pueba_CATH. Ingresa a localhost:5173/login. Usuario: ${username} | Clave: ${password}\n`);
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

        const urlStorage = tipo === 'texto' ? '' : `/uploads/induccion/${file?.filename}`;

        const contenido = {
            id: uuidv4(),
            titulo,
            tipo,
            urlStorage,
            orden: 0,
            activo: true,
            subidoEn: new Date().toISOString()
        };

        // Guardar en DB
        res.status(201).json(contenido);
    } catch (error) {
        res.status(500).json({ message: 'Error al subir archivo' });
    }
});

router.get('/content', async (req, res) => {
    try {
        // Consultar DB
        res.status(200).json([]);
    } catch (error) {
        res.status(500).json({ error: 'Error listando contenido' });
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
