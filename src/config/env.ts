// Environment configuration for the app
// These values are embedded at build time by Vite

export const ENV = {
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // App Info
  APP_NAME: 'SoulSanctuary',
  APP_VERSION: '2.0.0',
  
  // Feature Flags
  ENABLE_AI: true,
  ENABLE_CRISIS_DETECTION: true,
  ENABLE_NOTIFICATIONS: true,
  
  // Crisis Resources
  CRISIS_HOTLINE: '988',
  CRISIS_TEXT_LINE: '741741',
} as const;

// Validate required environment variables
export function validateEnv() {
  const required = [
    'VITE_CLERK_PUBLISHABLE_KEY',
  ];
  
  const missing = required.filter(
    (key) => !import.meta.env[key]
  );
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}`
    );
  }
}
