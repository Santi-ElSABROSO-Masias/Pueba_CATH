import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { EventUser, UserStatus } from '../../types';

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
                setUsers(response.data.data);
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
            const response = await apiClient.post('/registrations', userData);
            if (response.data.success) {
                setUsers(prev => [response.data.data, ...prev]);
                return response.data.data;
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
