import { authenticator } from 'otplib';

// otplib defaults to `window: 0` — an exact match against only the current
// 30-second time step, with zero tolerance. That's unrealistic for a real
// login: by the time a user reads a 6-digit code off their phone and types
// it in, the window has often already rolled over, so a genuinely correct
// code gets rejected. Allow one step of drift in each direction (RFC 6238's
// own recommendation), which is what virtually every TOTP implementation
// (Google Authenticator included) tolerates in practice.
authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function totpKeyUri(secret: string, accountEmail: string): string {
  return authenticator.keyuri(accountEmail, 'Pouso das Castanheiras — Painel', secret);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  return authenticator.verify({ token: code, secret });
}
