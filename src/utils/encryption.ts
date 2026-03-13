import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export function encryptData(data: string): string {
  if (!ENCRYPTION_KEY) return data;
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encrypted: string): string {
  if (!ENCRYPTION_KEY) return encrypted;
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hashSensitiveData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}
