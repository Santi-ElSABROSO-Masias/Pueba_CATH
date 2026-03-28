import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const CAMPUS_API_URL = import.meta.env.VITE_CAMPUS_API_URL;

if (!API_URL) {
  throw new Error('❌ VITE_API_URL no está definida en tiempo de ejecución.');
}

if (!CAMPUS_API_URL) {
  throw new Error('❌ VITE_CAMPUS_API_URL no está definida en tiempo de ejecución.');
}

export { API_URL, CAMPUS_API_URL };

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
