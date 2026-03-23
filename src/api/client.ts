import axios from 'axios';

// @ts-ignore
export const API_URL = import.meta.env.VITE_API_URL || 'https://plataforma-catalina-eventmanager-backend.c2awqr.easypanel.host/api';

// @ts-ignore
export const CAMPUS_API_URL = import.meta.env.VITE_CAMPUS_API_URL || 'https://plataforma-catalina-campus-cath-backend.c2awqr.easypanel.host/api';

// Cliente principal (eventmanager-backend)
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Cliente para Campus CATH
export const campusApiClient = axios.create({
    baseURL: CAMPUS_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor principal
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor Campus
campusApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);
