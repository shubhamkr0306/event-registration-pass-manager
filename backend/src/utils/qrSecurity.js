const crypto = require('crypto');
const env = require('../config/env');

// Organizational secret key for AES-256-GCM encryption
// Derived from JWT_SECRET + organizational salt to guarantee 256-bit key length
const QR_SECRET_KEY = crypto
  .createHash('sha256')
  .update((env.JWT_SECRET || 'eventpass_secure_jwt_2026') + '_eventpass_org_qr_secret')
  .digest();

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt pass payload into a tamper-proof, opaque token.
 * Output format: EPASS_<iv_hex>_<ciphertext_hex>_<auth_tag_hex>
 * 
 * When scanned by ordinary smartphone cameras, this produces random gibberish
 * and reveals ZERO attendee or event information.
 */
function encryptPassToken(payload) {
  try {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, QR_SECRET_KEY, iv);

    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    let encrypted = cipher.update(serialized, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `EPASS_${iv.toString('hex')}_${encrypted}_${authTag}`;
  } catch (error) {
    console.error('[QR Security Encrypt Error]:', error);
    throw new Error('Failed to generate secure QR token');
  }
}

/**
 * Decrypt and verify tamper-proof QR token.
 * Validates GCM authentication tag. If even 1 bit was altered or forged,
 * decryption fails and returns null.
 */
function decryptPassToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;

    // Check expected prefix
    if (!token.startsWith('EPASS_')) return null;

    const parts = token.split('_');
    if (parts.length !== 4) return null;

    const iv = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];
    const authTag = Buffer.from(parts[3], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, QR_SECRET_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    // Authentication tag mismatch or malformed ciphertext
    console.warn('[QR Security Decrypt Notice]: Invalid or forged token received:', error.message);
    return null;
  }
}

module.exports = {
  encryptPassToken,
  decryptPassToken,
};
