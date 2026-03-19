import { useState, useCallback } from 'react';
import { campusApiClient } from '../../../api/client';
import { TrabajadorTemporal, SolicitudInduccion, ContenidoCurso, ResultadoEvaluacion, Certificado, EstadoSolicitud } from '../types/induccion.types';

// Genera credenciales temporales para un trabajador
function generarCredenciales(dni: string) {
    const username = `temp_${dni}`;
    const letras = Math.random().toString(36).substring(2, 6).toUpperCase();
    const safeDni = String(dni);
    const ultimos = safeDni.substring(Math.max(0, safeDni.length - 4));
    const password = `${letras}${ultimos}!`;
    return { username, password };
}

export function useInduccion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        setError(null);
        try {
            return await fn();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error en la petición';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ─── Registro de trabajador ───
    // Genera username/password, crea usuario en campus_cath_backend,
    // y retorna las credenciales para mostrarlas en pantalla
    const registrarTrabajador = useCallback((data: Partial<TrabajadorTemporal>) => {
        return withLoading(async () => {
            const { username, password } = generarCredenciales(data.dni || '');

            // Crear usuario en campus_cath_backend (POST /api/users/worker)
            await campusApiClient.post('/users/worker', {
                dni: username,
                nombre: data.nombre,
                apellido: data.apellido,
                empresa: data.empresa,
                email: data.email,
                password,
            });

            // Enviar credenciales por email en background (no bloquea el registro)
            if (data.email) {
                campusApiClient.post('/notifications/send-credentials', {
                    email: data.email,
                    nombre: data.nombre,
                    username,
                    password,
                }).catch((err) => console.warn('[EMAIL] No se pudo enviar credenciales:', err.message));
            }

            return { username, password };
        });
    }, []);

    // ─── Registro masivo ───
    const registrarMasivo = useCallback((trabajadores: TrabajadorTemporal[]) => {
        return withLoading(async () => {
            const resultados = [];
            for (const trab of trabajadores) {
                const { username, password } = generarCredenciales(trab.dni);
                await campusApiClient.post('/users/worker', {
                    dni: username,
                    nombre: trab.nombre,
                    apellido: trab.apellido,
                    empresa: trab.empresa,
                    email: trab.email,
                    password,
                });
                resultados.push({ dni: trab.dni, username, password });
            }
            return { status: 'ok', count: resultados.length, resultados };
        });
    }, []);

    // ─── Listar contenido del curso de inducción ───
    // Llama a GET /api/courses, filtra el curso InduccionCorta,
    // y transforma las activities al formato del frontend
    const listarContenido = useCallback((): Promise<ContenidoCurso[]> => {
        return withLoading(async () => {
            const response = await campusApiClient.get('/courses');
            const courses = response.data;

            const inductionCourse = courses.find((c: any) => c.courseType === 'InduccionCorta');
            if (!inductionCourse || !inductionCourse.modules?.length) {
                return [];
            }

            const activities = inductionCourse.modules[0].activities || [];
            return activities.map((act: any) => ({
                id: act.id,
                titulo: act.title,
                tipo: act.activityType?.toLowerCase() === 'documento' ? 'pdf' : (act.activityType?.toLowerCase() || 'texto'),
                urlStorage: act.contentUrl,
                orden: act.sequenceOrder,
                activo: true,
                subidoEn: new Date().toISOString(),
            }));
        });
    }, []);

    // ─── Crear solicitud (mock — sin endpoint dedicado en campus_cath_backend) ───
    const crearSolicitud = useCallback((data: Partial<SolicitudInduccion>) => {
        return withLoading(async () => {
            const id = crypto.randomUUID();
            return { id, ...data };
        });
    }, []);

    // ─── Cambiar decisión de solicitud (mock) ───
    const cambiarDecisionSolicitud = useCallback((id: string, decision: EstadoSolicitud, observaciones?: string) => {
        return withLoading(async () => {
            return { status: 'ok', estado: decision };
        });
    }, []);

    // ─── Reordenar contenido (mock) ───
    const reordenarContenido = useCallback((ordenacion: { id: string; orden: number }[]) => {
        return withLoading(async () => {
            return { status: 'ok' };
        });
    }, []);

    // ─── Eliminar contenido (mock) ───
    const eliminarContenido = useCallback((id: string) => {
        return withLoading(async () => {
            return { status: 'ok' };
        });
    }, []);

    // ─── Registrar evaluación (mock) ───
    const registrarEvaluacion = useCallback((data: Partial<ResultadoEvaluacion>) => {
        return withLoading(async () => {
            const id = crypto.randomUUID();
            return { id, ...data };
        });
    }, []);

    // ─── Obtener certificado (mock) ───
    const obtenerCertificado = useCallback((id: string): Promise<Certificado> => {
        return withLoading(async () => {
            return {
                id: 'cert-' + id,
                evaluacionId: id,
                trabajadorId: '',
                codigoUnico: 'VERIF-' + crypto.randomUUID().substring(0, 8).toUpperCase(),
                emitidoEn: new Date().toISOString(),
            };
        });
    }, []);

    return {
        loading,
        error,
        registrarTrabajador,
        registrarMasivo,
        crearSolicitud,
        cambiarDecisionSolicitud,
        listarContenido,
        reordenarContenido,
        eliminarContenido,
        registrarEvaluacion,
        obtenerCertificado,
        setError
    };
}
