import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment
 * Derives a key using PBKDF2 for added security
 */
function getKey(salt: Buffer): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (!encryptionKey || encryptionKey === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    throw new Error('ENCRYPTION_KEY not configured. Set a secure 32-byte key in .env.local');
  }

  // Use PBKDF2 to derive key from env key and salt
  return crypto.pbkdf2Sync(encryptionKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive text data
 * Returns base64 encoded string containing: salt + iv + tag + ciphertext
 */
export function encrypt(text: string): string {
  try {
    if (!text) return '';

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key
    const key = getKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const tag = cipher.getAuthTag();
    
    // Combine: salt + iv + tag + ciphertext
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted text data
 * Expects base64 encoded string containing: salt + iv + tag + ciphertext
 */
export function decrypt(encryptedData: string): string {
  try {
    if (!encryptedData) return '';

    // Decode base64
    const data = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key
    const key = getKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or key incorrect');
  }
}

/**
 * Hash a value using SHA-256 (for non-reversible hashing like API keys)
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verify that encryption is properly configured
 */
export function verifyEncryptionSetup(): boolean {
  try {
    const testText = 'test';
    const encrypted = encrypt(testText);
    const decrypted = decrypt(encrypted);
    return decrypted === testText;
  } catch (error) {
    console.error('Encryption setup verification failed:', error);
    return false;
  }
}

/**
 * Encrypt an object's sensitive fields
 */
export function encryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] && typeof result[field] === 'string') {
      (result as any)[field] = encrypt(result[field]);
    }
  }
  
  return result;
}

/**
 * Decrypt an object's sensitive fields
 */
export function decryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        (result as any)[field] = decrypt(result[field]);
      } catch (error) {
        // If decryption fails, field might not be encrypted
        console.warn(`Failed to decrypt field ${String(field)}`);
      }
    }
  }
  
  return result;
}
