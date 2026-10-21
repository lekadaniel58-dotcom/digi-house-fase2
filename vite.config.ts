import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Use the same catalog files in development and in the published static site.
export default defineConfig({
  plugins: [react(), {
    name: 'static-catalog',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        const match = path.match(/^\/(?:digi-house-fase2\/)?data\/(catalogo\.csv|immagini\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp))$/i);
        if (!match) return next();
        try {
          const data = readFileSync(resolve('data', match[1]));
          const ext = match[1].split('.').pop()!.toLowerCase();
          res.setHeader('Content-Type', ext === 'csv' ? 'text/csv; charset=utf-8' : `image/${ext === 'jpg' ? 'jpeg' : ext}`);
          res.end(data);
        } catch { res.statusCode = 404; res.end('File non disponibile'); }
      });
    },
    writeBundle(options) {
      cpSync('data', resolve(options.dir ?? 'dist', 'data'), { recursive: true });
    },
  }],
  base: '/digi-house-fase2/',
});
