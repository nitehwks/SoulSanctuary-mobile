import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { AppError } from '../middleware/error';

// Initialize DOMPurify with JSDOM for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => 
          `${err.path.join('.')}: ${err.message}`
        );
        next(new AppError(`Validation error: ${messages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => 
          `${err.path.join('.')}: ${err.message}`
        );
        next(new AppError(`Query validation error: ${messages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => 
          `${err.path.join('.')}: ${err.message}`
        );
        next(new AppError(`Params validation error: ${messages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Sanitize a string to prevent XSS using DOMPurify
 * Strips ALL HTML tags (for plain text fields)
 */
export function sanitizeString(str: string): string {
  if (!str) return str;
  
  // Use DOMPurify for robust HTML sanitization
  return purify.sanitize(str, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true, // Keep the text content
  });
}

/**
 * Sanitize HTML content allowing safe tags
 * Use for rich text fields that need formatting
 */
export function sanitizeHtml(str: string): string {
  if (!str) return str;
  
  return purify.sanitize(str, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote'
    ],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Middleware to sanitize request body strings
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Recursively sanitize object values
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
