import express from 'express';
import { Express } from 'express';

export async function setupVite(app: Express, server: any) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  return server;
}

export function serveStatic(app: Express) {
  app.use(express.static('dist'));
}

export function log(message: string) {
  console.log(message);
}
