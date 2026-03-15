import express from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

export async function setupVite(app: Express, server: any) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  
  app.use(vite.middlewares);
  
  // Handle SPA routes - serve index.html for all non-API routes
  app.get('*', async (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
      return next();
    }
    
    try {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      let template = fs.readFileSync(indexPath, 'utf-8');
      
      // Transform the HTML using Vite
      template = await vite.transformIndexHtml(req.url, template);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  
  return server;
}

export function serveStatic(app: Express) {
  // Serve static files from dist
  app.use(express.static('dist'));
  
  // Handle SPA routes - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
  });
}

export function log(message: string) {
  console.log(message);
}
