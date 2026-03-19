import { useState, useCallback } from 'react';
import { campusApiClient } from '../../../api/client';
import { TrabajadorTemporal, SolicitudInduccion, ContenidoCurso, ResultadoEvaluacion, Certificado, EstadoSolicitud } from '../types/induccion.types';

export function useInduccion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiCall = async <T = any>(endpoint: string, method: string = 'GET', data?: any): Promise<T> => {
        setLoading(true);
        setError(null);
        try {
            const response = await campusApiClient.request<T>({
                url: `/induccion${endpoint}`,
                method,
                data,
            });
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error en la petición';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registrarTrabajador = useCallback((data: Partial<TrabajadorTemporal>) => {
        return apiCall('/trabajadores', 'POST', data);
    }, []);

    const registrarMasivo = useCallback((trabajadores: TrabajadorTemporal[]) => {
        return apiCall('/trabajadores/masivo', 'POST', { trabajadores });
    }, []);

    const crearSolicitud = useCallback((data: Partial<SolicitudInduccion>) => {
        return apiCall('/solicitud', 'POST', data);
    }, []);

    const cambiarDecisionSolicitud = useCallback((id: string, decision: EstadoSolicitud, observaciones?: string) => {
        return apiCall(`/solicitud/${id}/decision`, 'PATCH', { estado: decision, observaciones });
    }, []);

    const listarContenido = useCallback((): Promise<ContenidoCurso[]> => {
        return apiCall<ContenidoCurso[]>('/content', 'GET');
    }, []);

    const reordenarContenido = useCallback((ordenacion: { id: string; orden: number }[]) => {
        return apiCall('/content/reorder', 'PATCH', { ordenacion });
    }, []);

    const eliminarContenido = useCallback((id: string) => {
        return apiCall(`/content/${id}`, 'DELETE');
    }, []);

    const registrarEvaluacion = useCallback((data: Partial<ResultadoEvaluacion>) => {
        return apiCall('/evaluacion', 'POST', data);
    }, []);

    const obtenerCertificado = useCallback((id: string): Promise<Certificado> => {
        return apiCall<Certificado>(`/certificado/${id}`, 'GET');
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
