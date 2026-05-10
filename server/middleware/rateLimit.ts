import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMITS } from '../config/security';

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
  RATE_LIMITS.auth.max,
  RATE_LIMITS.auth.windowMs,
  'Too many authentication attempts. Please try again later.'
);

/**
 * Rate limiter for AI endpoints (expensive)
 * 20 requests per hour
 */
export const aiRateLimiter = createRateLimiter(
  RATE_LIMITS.ai.max,
  RATE_LIMITS.ai.windowMs,
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
  RATE_LIMITS.general.max,
  RATE_LIMITS.general.windowMs,
  'API rate limit exceeded. Please try again later.'
);

/**
 * Rate limiter for crisis endpoints (should be more lenient)
 * 10 requests per minute
 */
export const crisisRateLimiter = createRateLimiter(
  RATE_LIMITS.crisis.max,
  RATE_LIMITS.crisis.windowMs,
  'Too many crisis alerts. If you need immediate help, please call 988.'
);

/**
 * Webhook rate limiter (higher limit for external services)
 * 1000 requests per hour
 */
export const webhookRateLimiter = createRateLimiter(
  RATE_LIMITS.webhook.max,
  RATE_LIMITS.webhook.windowMs,
  'Webhook rate limit exceeded.'
);
