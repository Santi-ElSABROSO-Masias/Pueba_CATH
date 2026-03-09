import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Company } from '../../types';

export const useCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/companies');
            if (response.data.success) {
                setCompanies(response.data.data);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching companies:', err);
            setError(err.response?.data?.message || 'Error al cargar las empresas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const addCompany = async (companyData: Partial<Company>) => {
        try {
            const response = await apiClient.post('/companies', companyData);
            if (response.data.success) {
                setCompanies(prev => [...prev, response.data.data]);
                return response.data.data;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al agregar la empresa');
        }
    };

    const requestQuota = async (companyId: string, requestedAmount: number) => {
        try {
            const response = await apiClient.post(`/companies/${companyId}/request-quota`, { amount: requestedAmount });
            if (response.data.success) {
                // You might want to update the local company state here depending on what is returned
                return response.data.data;
            }
        } catch (err: any) {
            throw new Error(err.response?.data?.message || 'Error al solicitar cupos');
        }
    };

    return {
        companies,
        setCompanies,
        loading,
        error,
        refetch: fetchCompanies,
        addCompany,
        requestQuota
    };
};
