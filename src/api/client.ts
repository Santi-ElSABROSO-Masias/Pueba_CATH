import axios from 'axios';

// La URL base del backend que acabamos de crear
export const API_URL = (import.meta as any).env.VITE_API_URL || 'https://plataforma-catalina-eventmanager-backend.c2awqr.easypanel.host/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token JWT de Zustand/Context
apiClient.interceptors.request.use(
    (config) => {
        // Si estás usando localStorage o sessionStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
