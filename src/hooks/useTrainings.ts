import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Training } from '../../types';

// Mapea la respuesta snake_case del backend al formato camelCase del frontend
const mapTraining = (raw: any): Training => ({
    id: raw.id,
    title: raw.title || '',
    description: raw.description || '',
    date: raw.start_date || raw.date || '',
    endDate: raw.end_date || raw.endDate,
    isFullDay: raw.is_full_day ?? raw.isFullDay,
    maxCapacity: raw.max_capacity ?? raw.maxCapacity ?? 60,
    isPublished: raw.is_published ?? raw.isPublished ?? false,
    customQuestions: raw.custom_questions || raw.customQuestions || [],
    isConsolidated: raw.is_consolidated ?? raw.isConsolidated,
    consolidatedAt: raw.consolidated_at || raw.consolidatedAt,
    instructorName: raw.instructor_name || raw.instructorName,
    color: raw.color || '#0EA5E9',
    duration: raw.duration_hours ? `${raw.duration_hours} horas` : (raw.duration || ''),
    schedule: raw.schedule || '',
    group: raw.group_number || raw.group || '',
    companyId: raw.company_id ?? raw.companyId ?? null,
    registration_deadline: raw.registration_deadline || '',
    deadline_extended_at: raw.deadline_extended_at,
    deadline_extended_by: raw.deadline_extended_by,
    deadline_extension_reason: raw.deadline_extension_reason,
    monthly_schedule_id: raw.monthly_schedule_id,
    template_id: raw.template_id,
    is_active: raw.is_active,
    registeredCount: raw._count?.registrations ?? raw.registeredCount ?? 0,
    status: raw.status,
    meetingLink: raw.meeting_link || raw.meetingLink || '',
});

export const useTrainings = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrainings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/trainings');
            if (response.data.success) {
                const mapped = (response.data.data || []).map(mapTraining);
                setTrainings(mapped);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching trainings:', err);
            setError(err.message || 'Error al cargar las capacitaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrainings();
    }, [fetchTrainings]);

    const createTraining = async (trainingData: Omit<Training, 'id'>) => {
        try {
            const response = await apiClient.post('/trainings', trainingData);
            if (response.data.success) {
                const mapped = mapTraining(response.data.data);
                setTrainings(prev => [mapped, ...prev]);
                return mapped;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al crear la capacitación');
        }
    };

    const updateTraining = async (id: string, updateData: Partial<Training>) => {
        try {
            const response = await apiClient.put(`/trainings/${id}`, updateData);
            if (response.data.success) {
                const mapped = mapTraining(response.data.data);
                setTrainings(prev => prev.map(t => t.id === id ? mapped : t));
                return mapped;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al actualizar la capacitación');
        }
    };

    return {
        trainings,
        setTrainings,
        loading,
        error,
        refetch: fetchTrainings,
        createTraining,
        updateTraining
    };
};
