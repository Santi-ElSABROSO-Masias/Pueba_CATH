import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Training } from '../../types';

// Mapea la respuesta snake_case del backend al formato camelCase del frontend
export const mapTraining = (raw: any): Training => {
  const rawDate = raw.start_date || raw.date || '';
  const dateStr = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  
  const rawEndDate = raw.end_date || raw.endDate || '';
  const endDateStr = rawEndDate.includes('T') ? rawEndDate.split('T')[0] : rawEndDate;

  return {
    id: raw.id,
    title: raw.title || '',
    description: raw.description || '',
    date: dateStr,
    endDate: endDateStr,
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
    registration_deadline: raw.registration_deadline ? new Date(raw.registration_deadline).toISOString().slice(0, 16) : '',
    deadline_extended_at: raw.deadline_extended_at ? new Date(raw.deadline_extended_at).toISOString().slice(0, 16) : undefined,
    deadline_extended_by: raw.deadline_extended_by,
    deadline_extension_reason: raw.deadline_extension_reason,
    monthly_schedule_id: raw.monthly_schedule_id,
    template_id: raw.template_id,
    is_active: raw.is_active,
    registeredCount: raw._count?.registrations ?? raw.registeredCount ?? 0,
    status: raw.status,
    meetingLink: raw.meeting_link || raw.meetingLink || '',
  };
};

// Mapea datos camelCase del frontend al formato snake_case del backend
export const mapToBackend = (data: any) => {
    // Extraer start_time y end_time del campo "schedule" (ej: "8:00 am - 12:00 m")
    let startTime = '08:00';
    let endTime = '17:00';
    if (data.schedule) {
        const parts = data.schedule.split('-').map((s: string) => s.trim());
        if (parts.length >= 2) {
            startTime = normalizeTime(parts[0]);
            endTime = normalizeTime(parts[1]);
        }
    }

    // Parsear duration a número de horas
    let durationHours: number | undefined;
    if (data.duration) {
        const match = data.duration.match(/(\d+)/);
        if (match) durationHours = parseInt(match[1]);
    }

    // Parsear group a número
    let groupNumber: number | undefined;
    if (data.group) {
        const match = data.group.match(/(\d+)/);
        if (match) groupNumber = parseInt(match[1]);
    }

    // Construir fecha ISO para start_date
    const startDate = data.date
        ? new Date(data.date + 'T00:00:00').toISOString().slice(0, 16)
        : undefined;

    // Construir fecha ISO para registration_deadline
    const deadline = data.registration_deadline
        ? new Date(data.registration_deadline).toISOString().slice(0, 16)
        : undefined;

    const result: any = {
        title: data.title,
        description: data.description || '',
        start_date: startDate,
        start_time: startTime,
        end_time: endTime,
        max_capacity: data.maxCapacity ?? 60,
        duration_hours: durationHours,
        color: data.color,
        group_number: groupNumber,
        registration_deadline: deadline,
        meeting_link: data.meetingLink || undefined,
        status: 'active',
        is_active: true,
        is_published: data.isPublished ?? false,
        company_id: data.companyId || undefined,
        custom_questions: data.customQuestions || [],
    };

    // Limpiar undefined values para no enviar campos vacíos
    Object.keys(result).forEach(key => {
        if (result[key] === undefined) delete result[key];
    });

    return result;
};

// Normaliza strings de hora a formato HH:mm (ej: "8:00 am" → "08:00")
const normalizeTime = (timeStr: string): string => {
    const cleaned = timeStr.toLowerCase().replace(/[^\d:apm]/g, '').trim();
    const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|m)?$/);
    if (!match) return '08:00';

    let hours = parseInt(match[1]);
    const minutes = match[2] || '00';
    const period = match[3];

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

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
            const backendData = mapToBackend(trainingData);
            const response = await apiClient.post('/trainings', backendData);
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
            const backendData = mapToBackend(updateData);
            const response = await apiClient.put(`/trainings/${id}`, backendData);
            if (response.data.success) {
                const mapped = mapTraining(response.data.data);
                setTrainings(prev => prev.map(t => t.id === id ? mapped : t));
                return mapped;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al actualizar la capacitación');
        }
    };

    const deleteTraining = async (id: string) => {
        try {
            const response = await apiClient.delete(`/trainings/${id}`);
            if (response.data.success) {
                setTrainings(prev => prev.filter(t => t.id !== id));
                return true;
            }
            return false;
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al eliminar la capacitación');
        }
    };

    return {
        trainings,
        setTrainings,
        loading,
        error,
        refetch: fetchTrainings,
        createTraining,
        updateTraining,
        deleteTraining
    };
};
