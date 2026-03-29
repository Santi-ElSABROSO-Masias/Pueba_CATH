import axios from 'axios';

// Asegurar trailing slash: Axios elimina el path del baseURL (ej: /api)
// cuando las rutas empiezan con "/". Con trailing slash lo trata correctamente.
const rawApiUrl = import.meta.env.VITE_API_URL;
const rawCampusApiUrl = import.meta.env.VITE_CAMPUS_API_URL;

if (!rawApiUrl) {
  throw new Error('❌ VITE_API_URL no está definida en tiempo de ejecución.');
}

if (!rawCampusApiUrl) {
  throw new Error('❌ VITE_CAMPUS_API_URL no está definida en tiempo de ejecución.');
}

const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl : `${rawApiUrl}/`;
const CAMPUS_API_URL = rawCampusApiUrl.endsWith('/') ? rawCampusApiUrl : `${rawCampusApiUrl}/`;

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
