
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (!env.VITE_API_URL) {
    throw new Error('❌ VITE_API_URL no está definida. Agrégala al .env o en Easypanel.');
  }

  if (!env.VITE_CAMPUS_API_URL) {
    throw new Error('❌ VITE_CAMPUS_API_URL no está definida. Agrégala al .env o en Easypanel.');
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      host: '0.0.0.0',
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_CAMPUS_API_URL': JSON.stringify(env.VITE_CAMPUS_API_URL),
    },
  };
});
