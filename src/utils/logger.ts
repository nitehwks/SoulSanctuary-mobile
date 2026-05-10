/**
 * Client-side logging utility
 * 
 * In development: logs to console
 * In production: logs only errors, swallows debug/info logs
 * 
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.info('User action', { userId: '123' });
 *   logger.error('Request failed', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_DEV = import.meta.env.DEV;

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (IS_DEV) return true;
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const errorMeta = error instanceof Error 
      ? { ...meta, error: error.message, stack: error.stack }
      : meta;
    console.error(this.formatMessage('error', message, errorMeta));
  }
}

export const logger = new Logger();
