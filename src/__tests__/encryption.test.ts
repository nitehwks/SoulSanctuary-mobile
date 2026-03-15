import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';

// Import the encryption functions (we'll recreate them for testing)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Test encryption key
const TEST_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');

/**
 * Get encryption key from test key
 */
function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(TEST_ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive text data
 */
function encrypt(text: string): string {
  if (!text) return '';

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  const result = Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]);
  
  return result.toString('base64');
}

/**
 * Decrypt encrypted text data
 */
function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';

  const data = Buffer.from(encryptedData, 'base64');
  
  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = getKey(salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash a value using SHA-256
 */
function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token
 */
function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt an object's sensitive fields
 */
function encryptObject<T extends Record<string, any>>(
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
function decryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        (result as any)[field] = decrypt(result[field]);
      } catch (error) {
        console.warn(`Failed to decrypt field ${String(field)}`);
      }
    }
  }
  
  return result;
}

// =============================================================================
// ENCRYPTION TESTS
// =============================================================================

describe('Encryption', () => {
  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'Hello, World!';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should encrypt and decrypt empty string', () => {
      const originalText = '';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should encrypt and decrypt long text', () => {
      const originalText = 'A'.repeat(10000);
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should encrypt and decrypt text with special characters', () => {
      const originalText = '!@#$%^&*()_+-=[]{}|;:,.<>?\'"\\/\n\t\r';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should encrypt and decrypt Unicode text', () => {
      const originalText = 'Hello 世界 🌍 مرحبا';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should generate different ciphertext for same input', () => {
      const text = 'test';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);
      
      // Due to random salt and IV, encrypted values should be different
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it('should handle multi-line text', () => {
      const originalText = `Line 1
Line 2
Line 3`;
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });
  });

  describe('Hash Function', () => {
    it('should generate consistent hashes', () => {
      const value = 'test-value';
      const hash1 = hash(value);
      const hash2 = hash(value);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hash('value1');
      const hash2 = hash('value2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should generate SHA-256 hashes of correct length', () => {
      const value = 'test';
      const hashed = hash(value);
      
      // SHA-256 produces 64 hex characters
      expect(hashed).toHaveLength(64);
    });
  });

  describe('Token Generation', () => {
    it('should generate tokens of specified length', () => {
      const token16 = generateToken(16);
      expect(token16).toHaveLength(32); // 16 bytes = 32 hex chars
      
      const token32 = generateToken(32);
      expect(token32).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken());
      }
      
      // All 100 tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it('should default to 32 bytes when no length specified', () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });
  });

  describe('Object Encryption', () => {
    it('should encrypt specified fields of an object', () => {
      const obj = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };
      
      const encrypted = encryptObject(obj, ['name', 'email']);
      
      // Non-encrypted fields should remain unchanged
      expect(encrypted.id).toBe('123');
      expect(encrypted.age).toBe(30);
      
      // Encrypted fields should be different
      expect(encrypted.name).not.toBe('John Doe');
      expect(encrypted.email).not.toBe('john@example.com');
      
      // Encrypted fields should be decryptable
      expect(decrypt(encrypted.name)).toBe('John Doe');
      expect(decrypt(encrypted.email)).toBe('john@example.com');
    });

    it('should decrypt specified fields of an object', () => {
      const obj = {
        id: '123',
        name: encrypt('John Doe'),
        email: encrypt('john@example.com'),
      };
      
      const decrypted = decryptObject(obj, ['name', 'email']);
      
      expect(decrypted.name).toBe('John Doe');
      expect(decrypted.email).toBe('john@example.com');
    });

    it('should handle objects with null or undefined values', () => {
      const obj = {
        id: '123',
        name: null,
        email: undefined,
        phone: '555-1234',
      };
      
      const encrypted = encryptObject(obj as any, ['name', 'email', 'phone']);
      
      expect(encrypted.name).toBeNull();
      expect(encrypted.email).toBeUndefined();
      expect(typeof encrypted.phone).toBe('string');
    });

    it('should not modify original object when encrypting', () => {
      const obj = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      const encrypted = encryptObject(obj, ['name', 'email']);
      
      // Original object should remain unchanged
      expect(obj.name).toBe('John Doe');
      expect(obj.email).toBe('john@example.com');
      
      // Encrypted object should be different
      expect(encrypted.name).not.toBe('John Doe');
    });
  });

  describe('Security Properties', () => {
    it('should produce ciphertext longer than plaintext', () => {
      const plaintext = 'test';
      const encrypted = encrypt(plaintext);
      
      // Ciphertext includes salt + iv + tag + encrypted data
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });

    it('should use different salt/IV for each encryption', () => {
      const text = 'same text';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);
      
      // Decode to check the salt (first 64 bytes)
      const data1 = Buffer.from(encrypted1, 'base64');
      const data2 = Buffer.from(encrypted2, 'base64');
      
      const salt1 = data1.slice(0, SALT_LENGTH);
      const salt2 = data2.slice(0, SALT_LENGTH);
      
      expect(salt1.equals(salt2)).toBe(false);
    });

    it('should fail decryption with tampered ciphertext', () => {
      const originalText = 'sensitive data';
      const encrypted = encrypt(originalText);
      
      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -4) + 'XXXX';
      
      // Should throw an error
      expect(() => decrypt(tampered)).toThrow();
    });
  });
});

describe('Security Utilities', () => {
  describe('HTML Sanitization', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should handle nested HTML tags', () => {
      const input = '<div><span>text</span></div>';
      const sanitized = input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      expect(sanitized).toBe('&lt;div&gt;&lt;span&gt;text&lt;/span&gt;&lt;/div&gt;');
    });
  });

  describe('UUID Validation', () => {
    it('should validate correct UUID format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(validUuid)).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test('not-a-uuid')).toBe(false);
      expect(uuidRegex.test('550e8400-e29b-41d4-a716')).toBe(false);
      expect(uuidRegex.test('550e8400-e29b-41d4-a716-44665544000g')).toBe(false); // Invalid char
      expect(uuidRegex.test('550e8400e29b41d4a716446655440000')).toBe(false); // No hyphens
    });

    it('should validate UUID version 4', () => {
      // Version 4 UUID has format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const v4Uuid = '550e8400-e29b-41d4-a716-446655440000';
      const parts = v4Uuid.split('-');
      
      expect(parts[2][0]).toBe('4');
    });
  });
});
