import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Default error values
  let statusCode = 500;
  let message = 'Something went wrong';

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ZodError') {
    // Validation errors
    statusCode = 400;
    message = 'Validation failed: ' + err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    timestamp: new Date().toISOString(),
  });

  // Send response
  const errorResponse: any = {
    success: false,
    error: message,
    ...(isDev && {
      stack: err.stack,
      name: err.name,
    }),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request validation error handler
 */
export function handleValidationError(errors: any[]) {
  const message = errors.map(err => `${err.path}: ${err.message}`).join(', ');
  return new AppError(message, 400);
}

/**
 * Database error handler
 */
export function handleDatabaseError(error: any): AppError {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return new AppError('Duplicate entry - this record already exists', 409);
  }
  if (error.code === '23503') {
    return new AppError('Referenced record not found', 404);
  }
  if (error.code === '23502') {
    return new AppError('Required field missing', 400);
  }
  
  return new AppError('Database error', 500);
}
