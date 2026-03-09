import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Training } from '../../types';

export const useTrainings = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrainings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/trainings');
            if (response.data.success) {
                setTrainings(response.data.data);
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
                setTrainings(prev => [response.data.data, ...prev]);
                return response.data.data;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al crear la capacitación');
        }
    };

    const updateTraining = async (id: string, updateData: Partial<Training>) => {
        try {
            const response = await apiClient.put(`/trainings/${id}`, updateData);
            if (response.data.success) {
                setTrainings(prev => prev.map(t => t.id === id ? response.data.data : t));
                return response.data.data;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al actualizar la capacitación');
        }
    };

    return {
        trainings,
        setTrainings, // Expose for optimistic updates from schedule creation
        loading,
        error,
        refetch: fetchTrainings,
        createTraining,
        updateTraining
    };
};
