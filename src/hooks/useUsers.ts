import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { EventUser, UserStatus } from '../../types';

// Mapea del camelCase (frontend) a snake_case (Backend endpoint /registrations)
export const mapUserToBackend = (data: Partial<EventUser>) => ({
    training_id: data.trainingId,
    full_name: data.name,
    dni: data.dni,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    area: data.area || undefined,
    role: data.role || undefined,
    brevete: data.brevete || undefined,
    // customAnswers y photo se ignorarán si el esquema no los declara, o se deben tratar aparte
});

// Mapea back a Frontend
export const mapUserFromBackend = (raw: any): EventUser => ({
    id: raw.id,
    trainingId: raw.training_id || raw.trainingId,
    name: raw.full_name || raw.name,
    email: raw.email,
    phone: raw.phone || '',
    dni: raw.dni || '',
    organization: raw.organization || '',
    area: raw.area || '',
    role: raw.role || '',
    brevete: raw.brevete,
    status: raw.status as UserStatus || UserStatus.REGISTERED,
    meetingLink: raw.meeting_link,
    attended: raw.attended || false,
    registeredAt: raw.created_at || raw.registeredAt || new Date().toISOString(),
    identity_validated: raw.identity_validated || false,
    validation_link: raw.validation_link || '',
    score: raw.score,
    certificateUrl: raw.certificate_url,
    dniPhoto: raw.dni_photo || raw.dniPhoto,
});

export const useUsers = () => {
    const [users, setUsers] = useState<EventUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Endpoint to list registrations and the associated users
            const response = await apiClient.get('/registrations');
            if (response.data.success) {
                const mapped = (response.data.data || []).map(mapUserFromBackend);
                setUsers(mapped);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Error al cargar los trabajadores');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const registerUser = async (userData: Partial<EventUser>) => {
        try {
            const backendData = mapUserToBackend(userData);
            const response = await apiClient.post('/registrations', backendData);
            if (response.data.success) {
                const mapped = mapUserFromBackend(response.data.data);
                setUsers(prev => [mapped, ...prev]);
                return mapped;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al registrar al trabajador');
        }
    };

    const updateUserStatus = async (userId: string, status: UserStatus, meetingLink?: string) => {
        try {
            // Note: backend splits level 1 & 2 approvals. We'll simulate a simple approval pass for UI mapping.
            const response = await apiClient.patch(`/registrations/${userId}/approve-level-1`, { status, meetingLink });
            if (response.data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status, meetingLink: meetingLink || u.meetingLink } : u));
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al actualizar el estado');
        }
    };

    const toggleAttendance = async (userId: string, attended: boolean) => {
        try {
            // Optional: Backend endpoint for attendance
            // const response = await apiClient.patch(`/registrations/${userId}/attendance`, { attended });
            // if (response.data.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, attended } : u));
            // }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al registrar la asistencia');
        }
    };

    return {
        users,
        setUsers,
        loading,
        error,
        refetch: fetchUsers,
        registerUser,
        updateUserStatus,
        toggleAttendance
    };
};
