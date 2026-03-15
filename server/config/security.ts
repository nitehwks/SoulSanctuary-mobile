/**
 * Security Configuration
 * 
 * This file contains security-related constants and configuration
 * that should be used throughout the application.
 */

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

// Session/JWT configuration
export const SESSION_CONFIG = {
  accessTokenExpiry: '15m',     // 15 minutes
  refreshTokenExpiry: '7d',     // 7 days
  maxSessionsPerUser: 5,
};

// Rate limiting defaults
export const RATE_LIMITS = {
  auth: { max: 5, windowMs: 60 * 1000 },           // 5 per minute
  ai: { max: 20, windowMs: 60 * 60 * 1000 },       // 20 per hour
  general: { max: 100, windowMs: 60 * 1000 },      // 100 per minute
  crisis: { max: 10, windowMs: 60 * 1000 },        // 10 per minute
  webhook: { max: 1000, windowMs: 60 * 60 * 1000 }, // 1000 per hour
};

// Content Security Policy
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:', 'https://*.clerk.accounts.dev', 'https://img.clerk.com'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: [
    "'self'",
    'https://*.clerk.accounts.dev',
    'https://api.openrouter.ai',
    'https://www.googleapis.com',
    'wss://*.clerk.accounts.dev',
  ],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'self'", 'https://*.clerk.accounts.dev'],
};

// CORS configuration
export const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  
  // Default origins
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'capacitor://localhost',
    'ionic://localhost',
    'https://soulsanctuary.app',
    'https://www.soulsanctuary.app',
  ];
};

// Encryption configuration
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 64,
  iterations: 100000,
};

// Input validation limits
export const VALIDATION_LIMITS = {
  titleMaxLength: 255,
  descriptionMaxLength: 2000,
  contentMaxLength: 10000,
  noteMaxLength: 2000,
  maxEmotions: 10,
  maxRelatedNodes: 20,
  maxChatHistory: 50,
  maxMoodEntries: 100,
};

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Audit log events
export const AUDIT_EVENTS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  MOOD_CREATED: 'MOOD_CREATED',
  MOOD_UPDATED: 'MOOD_UPDATED',
  MOOD_DELETED: 'MOOD_DELETED',
  GOAL_CREATED: 'GOAL_CREATED',
  GOAL_UPDATED: 'GOAL_UPDATED',
  GOAL_DELETED: 'GOAL_DELETED',
  MEMORY_CREATED: 'MEMORY_CREATED',
  MEMORY_UPDATED: 'MEMORY_UPDATED',
  MEMORY_DELETED: 'MEMORY_DELETED',
  CRISIS_ALERT: 'CRISIS_ALERT',
  CRISIS_INTERVENTION: 'CRISIS_INTERVENTION',
  CRISIS_DETECTED: 'CRISIS_DETECTED',
  CRISIS_RESOLVED: 'CRISIS_RESOLVED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
} as const;

// Sensitive fields that should never be logged
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'privateKey',
  'creditCard',
  'ssn',
  'encryptionKey',
  'encryptionIv',
];

/**
 * Sanitize sensitive data from objects before logging
 */
export function sanitizeSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains any sensitive field name
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeSensitiveData(sanitized[key]);
    }
  }
  
  return sanitized;
}
