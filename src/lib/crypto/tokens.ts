import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// ===========================================
// PIXLY - Token Encryption (AES-256-GCM)
// Encrypts OAuth tokens before Firestore storage
// ===========================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = 'enc:';

function getEncryptionKey(): Buffer | null {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key || key.length !== 64) return null; // 64 hex chars = 32 bytes = 256 bits
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a token string using AES-256-GCM.
 * Returns prefixed ciphertext: "enc:<iv>:<authTag>:<ciphertext>" (all base64).
 * If no encryption key is configured, returns the token as-is.
 */
export function encryptToken(token: string): string {
  if (!token) return token;

  const key = getEncryptionKey();
  if (!key) return token; // Graceful fallback: no encryption

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a token string.
 * Handles both encrypted ("enc:...") and legacy plaintext tokens.
 */
export function decryptToken(stored: string): string {
  if (!stored) return stored;

  // Legacy plaintext token — no prefix
  if (!stored.startsWith(ENCRYPTED_PREFIX)) return stored;

  const key = getEncryptionKey();
  if (!key) {
    console.warn('TOKEN_ENCRYPTION_KEY not set — cannot decrypt token');
    return '';
  }

  const payload = stored.slice(ENCRYPTED_PREFIX.length);
  const [ivB64, tagB64, cipherB64] = payload.split(':');

  if (!ivB64 || !tagB64 || !cipherB64) {
    console.error('Malformed encrypted token');
    return '';
  }

  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(cipherB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}
