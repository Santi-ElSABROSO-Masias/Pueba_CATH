
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para obtener la ruta del directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cloud Run define el puerto dinámicamente mediante la variable de entorno PORT
const port = process.env.PORT || 8080;

// 1. MIDDLEWARE: Servir archivos estáticos (js, css, imágenes) directamente desde la raíz
// Esto permite que el navegador encuentre index.tsx, App.tsx, etc.
app.use(express.static(__dirname));

// 2. ROUTING WILDCARD: Manejo de SPA
// Captura cualquier ruta (ej. /registro, /dashboard) que no haya sido servida como archivo estático.
// Es crucial que esta ruta vaya DESPUÉS de express.static.
app.get('*', (req, res) => {
  // Siempre enviamos el index.html para que React Router tome el control en el cliente
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// 3. START: Escuchar en 0.0.0.0 es mandatorio para Google Cloud Run
app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] EventManager activo en puerto: ${port}`);
  console.log(`[Server] Ruta base del proyecto: ${__dirname}`);
});
