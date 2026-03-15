import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Create a rate limiter with custom options
 */
function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  message: string
) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
    // Skip rate limiting for health checks
    skip: (req: Request) => {
      return req.path === '/health';
    },
  });
}

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per minute
 */
export const authRateLimiter = createRateLimiter(
  5,
  60 * 1000, // 1 minute
  'Too many authentication attempts. Please try again later.'
);

/**
 * Rate limiter for AI endpoints (expensive)
 * 20 requests per hour
 */
export const aiRateLimiter = createRateLimiter(
  20,
  60 * 60 * 1000, // 1 hour
  'AI request limit reached. Please try again later.'
);

/**
 * Rate limiter for write operations
 * 30 requests per minute
 */
export const writeRateLimiter = createRateLimiter(
  30,
  60 * 1000, // 1 minute
  'Too many write operations. Please slow down.'
);

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const generalRateLimiter = createRateLimiter(
  100,
  60 * 1000, // 1 minute
  'API rate limit exceeded. Please try again later.'
);

/**
 * Rate limiter for crisis endpoints (should be more lenient)
 * 10 requests per minute
 */
export const crisisRateLimiter = createRateLimiter(
  10,
  60 * 1000, // 1 minute
  'Too many crisis alerts. If you need immediate help, please call 988.'
);

/**
 * Webhook rate limiter (higher limit for external services)
 * 1000 requests per hour
 */
export const webhookRateLimiter = createRateLimiter(
  1000,
  60 * 60 * 1000, // 1 hour
  'Webhook rate limit exceeded.'
);
