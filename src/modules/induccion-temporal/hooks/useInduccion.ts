import { useState, useCallback } from 'react';
import { TrabajadorTemporal, SolicitudInduccion, ContenidoCurso, ResultadoEvaluacion, Certificado, EstadoSolicitud } from '../types/induccion.types';

export function useInduccion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/induccion${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {}),
                },
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error en la petición');
            }
            return await response.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registrarTrabajador = useCallback((data: Partial<TrabajadorTemporal>) => {
        return apiCall('/trabajadores', { method: 'POST', body: JSON.stringify(data) });
    }, []);

    const registrarMasivo = useCallback((trabajadores: TrabajadorTemporal[]) => {
        return apiCall('/trabajadores/masivo', { method: 'POST', body: JSON.stringify({ trabajadores }) });
    }, []);

    const crearSolicitud = useCallback((data: Partial<SolicitudInduccion>) => {
        return apiCall('/solicitud', { method: 'POST', body: JSON.stringify(data) });
    }, []);

    const cambiarDecisionSolicitud = useCallback((id: string, decision: EstadoSolicitud, observaciones?: string) => {
        return apiCall(`/solicitud/${id}/decision`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: decision, observaciones })
        });
    }, []);

    const listarContenido = useCallback((): Promise<ContenidoCurso[]> => {
        return apiCall('/content', { method: 'GET' });
    }, []);

    const reordenarContenido = useCallback((ordenacion: { id: string; orden: number }[]) => {
        return apiCall('/content/reorder', { method: 'PATCH', body: JSON.stringify({ ordenacion }) });
    }, []);

    const eliminarContenido = useCallback((id: string) => {
        return apiCall(`/content/${id}`, { method: 'DELETE' });
    }, []);

    const registrarEvaluacion = useCallback((data: Partial<ResultadoEvaluacion>) => {
        return apiCall('/evaluacion', { method: 'POST', body: JSON.stringify(data) });
    }, []);

    const obtenerCertificado = useCallback((id: string): Promise<Certificado> => {
        return apiCall(`/certificado/${id}`, { method: 'GET' });
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
