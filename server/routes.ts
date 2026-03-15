import { Express } from 'express';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { sanitizeBody } from './validation/middleware';
import { 
  aiRateLimiter, 
  generalRateLimiter,
  crisisRateLimiter,
  webhookRateLimiter 
} from './middleware/rateLimit';
import moodRoutes from './routes/moods';
import goalRoutes from './routes/goals';
import memoryRoutes from './routes/memories';
import analyticsRoutes from './routes/analytics';
import crisisRoutes from './routes/crisis';
import aiRoutes from './routes/ai';
import userRoutes from './routes/user';
import notificationRoutes from './routes/notifications';
import webhookRoutes from './routes/webhooks';
import logger from './services/logger';

export async function registerRoutes(app: Express) {
  // Apply general rate limiting to all routes
  app.use(generalRateLimiter);
  
  // Apply sanitization to all routes
  app.use(sanitizeBody);

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        req.method,
        req.originalUrl,
        res.statusCode,
        duration,
        (req as any).auth?.userId
      );
    });
    
    next();
  });

  // Public routes
  app.use('/api/webhooks', webhookRateLimiter, webhookRoutes);

  // Protected routes - all require authentication
  app.use('/api/moods', authMiddleware, moodRoutes);
  app.use('/api/goals', authMiddleware, goalRoutes);
  app.use('/api/memories', authMiddleware, memoryRoutes);
  app.use('/api/analytics', authMiddleware, analyticsRoutes);
  app.use('/api/crisis', authMiddleware, crisisRateLimiter, crisisRoutes);
  app.use('/api/ai', authMiddleware, aiRateLimiter, aiRoutes);
  app.use('/api/user', authMiddleware, userRoutes);
  app.use('/api/notifications', authMiddleware, notificationRoutes);

  // NOTE: 404 handler is now in server/index.ts to allow SPA routes
  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}
