// Load environment FIRST - must be before any other imports
import './env-loader';

import express, { type Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';
import { serveStatic, log } from './vite';
import { notFoundHandler } from './middleware/error';

const app = express();

// ==========================================
// Security Headers (Helmet)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React
        "'unsafe-eval'",   // Required for React development
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components/CSS-in-JS
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://*.clerk.accounts.dev',
        'https://img.clerk.com',
      ],
      fontSrc: [
        "'self'",
        'data:',
      ],
      connectSrc: [
        "'self'",
        'https://*.clerk.accounts.dev',
        'https://api.openrouter.ai',
        'https://www.googleapis.com',
        'wss://*.clerk.accounts.dev',
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: [
        "'self'",
        'https://*.clerk.accounts.dev',
      ],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'capacitor://localhost',
      'ionic://localhost',
      'https://soulsanctuary.app',
      'https://www.soulsanctuary.app',
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
}));

// ==========================================
// Middleware
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ==========================================
// Logging middleware
// ==========================================
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, arguments as any);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }
      log(logLine);
    }
  });

  next();
});

// ==========================================
// Security: Remove sensitive headers
// ==========================================
app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// ==========================================
// Health check endpoint
// ==========================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// Register API routes
// ==========================================
(async () => {
  let server: any;
  let vite: any;
  
  if (app.get('env') === 'development') {
    const { createServer } = await import('vite');
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }
  
  // Register API routes FIRST
  server = await registerRoutes(app);
  
  // Then handle SPA routes (in development)
  if (app.get('env') === 'development' && vite) {
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.url.startsWith('/api')) return next();
      
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production: serve static files
    serveStatic(app);
  }
  
  // 404 handler for API routes (after SPA routes)
  app.use('/api', notFoundHandler);

  // Error handling middleware - MUST be last
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Don't leak stack traces in production
    if (process.env.NODE_ENV === 'production') {
      res.status(status).json({ message });
    } else {
      res.status(status).json({ message, stack: err.stack });
    }
  });

  // Start server
  const PORT = parseInt(process.env.PORT || '3001', 10);
  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running on port ${PORT}`);
  });
})();
