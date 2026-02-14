
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Configuración segura de headers para archivos TypeScript/React
// Esto evita el uso de 'express.static.mime.define' que puede causar errores en ciertas versiones
const setHeaders = (res, filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
};

// 1. Servir archivos estáticos con la configuración de headers corregida
app.use(express.static(__dirname, { setHeaders }));

// 2. Manejo de rutas SPA (Single Page Application)
// Esta lógica captura CUALQUIER ruta que no haya sido encontrada por express.static
app.get('*', (req, res) => {
  // Evitar devolver index.html para archivos de recursos faltantes (imágenes, scripts, estilos)
  // Si la ruta tiene una extensión (ej. .png, .js) y NO es .html, devolvemos 404 real
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('Not Found');
  }

  // Para todo lo demás (rutas de navegación como /registro, /admin, etc.), devolvemos index.html
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error enviando index.html:', err);
      res.status(500).send('Server Error');
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] EventManager activo en puerto: ${port}`);
});
