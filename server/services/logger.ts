import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'soulsanctuary-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    })
  );
}

// Helper functions for structured logging
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, any>
): void {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...context,
  });
}

export function logWarn(message: string, context?: Record<string, any>): void {
  logger.warn(message, context);
}

export function logInfo(message: string, context?: Record<string, any>): void {
  logger.info(message, context);
}

export function logHttp(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string
): void {
  logger.http(`${method} ${url}`, {
    method,
    url,
    statusCode,
    duration,
    userId,
  });
}

export function logDebug(message: string, context?: Record<string, any>): void {
  logger.debug(message, context);
}

// Audit logging for sensitive operations
export function logAudit(
  action: string,
  userId: string,
  details: Record<string, any>
): void {
  logger.info(`AUDIT: ${action}`, {
    type: 'audit',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export default logger;
