import { authenticator } from 'otplib';

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function totpKeyUri(secret: string, accountEmail: string): string {
  return authenticator.keyuri(accountEmail, 'Pouso das Castanheiras — Painel', secret);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  return authenticator.verify({ token: code, secret });
}
