import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './encryption';

beforeAll(() => {
  process.env.TOTP_ENCRYPTION_KEY = 'test-key-for-vitest-only-not-a-real-secret';
});

describe('encrypt / decrypt', () => {
  it('round-trips a plain text value', () => {
    const original = 'JBSWY3DPEHPK3PXP';
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const original = 'JBSWY3DPEHPK3PXP';
    expect(encrypt(original)).not.toBe(encrypt(original));
  });

  it('throws when the payload has been tampered with', () => {
    const encrypted = encrypt('secret-value');
    const tampered = encrypted.slice(0, -2) + '00';
    expect(() => decrypt(tampered)).toThrow();
  });
});
