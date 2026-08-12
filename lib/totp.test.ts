import { describe, it, expect } from 'vitest';
import { authenticator } from 'otplib';
import { generateTotpSecret, totpKeyUri, verifyTotpCode } from './totp';

describe('generateTotpSecret', () => {
  it('returns a non-empty base32 secret', () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThan(0);
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it('returns a different secret each time', () => {
    expect(generateTotpSecret()).not.toBe(generateTotpSecret());
  });
});

describe('totpKeyUri', () => {
  it('builds an otpauth:// URI containing the secret and the account label', () => {
    const uri = totpKeyUri('JBSWY3DPEHPK3PXP', 'ana@pousodascastanheiras.com.br');
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('JBSWY3DPEHPK3PXP');
    expect(decodeURIComponent(uri)).toContain('ana@pousodascastanheiras.com.br');
  });
});

describe('verifyTotpCode', () => {
  it('accepts the current valid code for a secret', () => {
    const secret = generateTotpSecret();
    const validCode = authenticator.generate(secret);
    expect(verifyTotpCode(secret, validCode)).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, '000000')).toBe(false);
  });
});
