import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = 3000;

function installImageExtensionFallback() {
  // Allow the app to request an image as .jpg while the actual file is
  // .png (or .jpeg), and vice versa. This makes replacing/renaming
  // showroom images between JPG and PNG work without editing every URL.
  app.use('/images', (req, res, next) => {
    const requested = decodeURIComponent(req.path).replace(/^\/+/, '');
    const match = requested.match(/^(.*)\.(jpg|jpeg|png)$/i);

    // Only handle normal image filenames; let Vite/static handling process everything else.
    if (!match || requested.includes('..')) return next();

    const baseName = match[1];
    const requestedExt = match[2].toLowerCase();
    const extensions = requestedExt === 'png'
      ? ['.png', '.jpg', '.jpeg']
      : ['.jpg', '.jpeg', '.png'];

    const roots = process.env.NODE_ENV === 'production'
      ? [path.join(process.cwd(), 'dist', 'images'), path.join(process.cwd(), 'public', 'images')]
      : [path.join(process.cwd(), 'public', 'images'), path.join(process.cwd(), 'dist', 'images')];

    for (const root of roots) {
      for (const ext of extensions) {
        const candidate = path.join(root, baseName + ext);
        if (fs.existsSync(candidate)) {
          return res.sendFile(candidate);
        }
      }
    }

    next();
  });
}

async function startServer() {
  installImageExtensionFallback();

  // Vite middleware in development or static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kairos Addis Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]', err);
});
