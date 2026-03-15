// =============================================================================
// PROFILE ENCRYPTION SERVICE
// Handles encryption/decryption of sensitive user profile data
// Uses AES-256-GCM for authenticated encryption
// =============================================================================

import crypto from 'crypto';
import { logError } from './logger';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

// Get encryption key from environment
const getMasterKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not configured');
  }
  // Derive a 32-byte key from the provided key
  return crypto.scryptSync(key, 'soulsanctuary-salt', KEY_LENGTH);
};

// Get or derive user-specific key
const getUserKey = (userId: string): Buffer => {
  const masterKey = getMasterKey();
  // Derive user-specific key using HMAC
  return crypto.createHmac('sha256', masterKey).update(userId).digest();
};

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive profile data
 */
export function encryptProfileData(userId: string, data: unknown): string {
  try {
    const key = getUserKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine all components into a single string
    const encryptedPackage: EncryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
    
    return Buffer.from(JSON.stringify(encryptedPackage)).toString('base64');
  } catch (error) {
    logError('Profile encryption failed', error as Error);
    throw new Error('Failed to encrypt profile data');
  }
}

/**
 * Decrypt sensitive profile data
 */
export function decryptProfileData<T>(userId: string, encryptedString: string): T {
  try {
    const key = getUserKey(userId);
    const encryptedPackage: EncryptedData = JSON.parse(
      Buffer.from(encryptedString, 'base64').toString('utf8')
    );
    
    const iv = Buffer.from(encryptedPackage.iv, 'hex');
    const authTag = Buffer.from(encryptedPackage.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedPackage.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as T;
  } catch (error) {
    logError('Profile decryption failed', error as Error);
    throw new Error('Failed to decrypt profile data');
  }
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32;
}

/**
 * Re-encrypt data with a new key (for key rotation)
 */
export function reencryptProfileData(
  userId: string,
  encryptedString: string,
  newKey?: string
): string {
  const data = decryptProfileData<unknown>(userId, encryptedString);
  
  if (newKey) {
    // Temporarily override key for re-encryption
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = newKey;
    
    try {
      const result = encryptProfileData(userId, data);
      process.env.ENCRYPTION_KEY = originalKey;
      return result;
    } catch (error) {
      process.env.ENCRYPTION_KEY = originalKey;
      throw error;
    }
  }
  
  return encryptProfileData(userId, data);
}
