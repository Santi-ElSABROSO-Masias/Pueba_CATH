import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para módulos ES (necesario para usar 'import' en Node)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run inyecta su propio puerto aquí; si estás local, usará el 8080
const port = process.env.PORT || 8080;

// Vite empaqueta tu proyecto terminado en una carpeta llamada 'dist'
const distPath = path.join(__dirname, 'dist');

// 1. Servir los archivos estáticos ya construidos y optimizados desde 'dist'
app.use(express.static(distPath));

// 2. Manejo de rutas SPA (Single Page Application)
// Cualquier ruta de React que el usuario escriba devolverá el index.html optimizado
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 0.0.0.0 es obligatorio para que Google Cloud Run pueda exponer la app a internet
app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] EventManager activo en puerto: ${port} (Sirviendo carpeta /dist)`);
});