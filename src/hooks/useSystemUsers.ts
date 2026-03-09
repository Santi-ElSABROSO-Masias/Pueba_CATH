import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { SystemUser } from '../../types';

export const useSystemUsers = () => {
    const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSystemUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/users');
            if (response.data.success) {
                setSystemUsers(response.data.data);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching system users:', err);
            setError(err.response?.data?.message || 'Error al cargar los usuarios del sistema');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSystemUsers();
    }, [fetchSystemUsers]);

    const addSystemUser = async (userData: Partial<SystemUser>) => {
        try {
            const response = await apiClient.post('/users', userData);
            if (response.data.success) {
                setSystemUsers(prev => [...prev, response.data.data]);
                return response.data.data;
            }
        } catch (err: any) {
            console.error(err.response?.data);
            throw new Error(JSON.stringify(err.response?.data?.errors) || err.response?.data?.message || 'Error al agregar el usuario');
        }
    };

    const updateSystemUser = async (userData: SystemUser) => {
        try {
            const response = await apiClient.put(`/users/${userData.id}`, userData);
            if (response.data.success) {
                setSystemUsers(prev => prev.map(u => u.id === userData.id ? response.data.data : u));
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al actualizar el usuario');
        }
    };

    const toggleUserStatus = async (userId: string) => {
        const user = systemUsers.find(u => u.id === userId);
        if (!user) return;
        try {
            // Simulating toggle by flipping isActive and firing put
            const updated = { ...user, isActive: !user.isActive };
            await updateSystemUser(updated);
        } catch (e) {
            throw e;
        }
    };

    return {
        systemUsers,
        setSystemUsers,
        loading,
        error,
        refetch: fetchSystemUsers,
        addSystemUser,
        updateSystemUser,
        toggleUserStatus
    };
};
