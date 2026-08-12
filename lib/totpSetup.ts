import { prisma } from '@/lib/prisma';
import { generateTotpSecret, totpKeyUri } from '@/lib/totp';
import { encrypt } from '@/lib/encryption';
import QRCode from 'qrcode';

export async function startTotpSetup(userId: string, email: string): Promise<{ qrCodeDataUrl: string }> {
  const secret = generateTotpSecret();
  await prisma.staffUser.update({
    where: { id: userId },
    data: { totpSecretEnc: encrypt(secret) },
  });
  const uri = totpKeyUri(secret, email);
  const qrCodeDataUrl = await QRCode.toDataURL(uri);
  return { qrCodeDataUrl };
}

export async function confirmTotpSetup(userId: string): Promise<void> {
  await prisma.staffUser.update({
    where: { id: userId },
    data: { totpEnabledAt: new Date() },
  });
}
