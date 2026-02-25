
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Configuración para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  // API routes go here (if any)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    app.use(express.static(__dirname));
    
    app.get('*', (req, res) => {
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return res.status(404).send('Not Found');
      }
      res.sendFile(path.join(__dirname, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] EventManager activo en puerto: ${port}`);
  });
}

startServer();
