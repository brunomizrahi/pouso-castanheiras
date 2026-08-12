import { prisma } from '@/lib/prisma';
import { generateTotpSecret, totpKeyUri } from '@/lib/totp';
import { encrypt, decrypt } from '@/lib/encryption';
import QRCode from 'qrcode';

export async function startTotpSetup(userId: string, email: string): Promise<{ qrCodeDataUrl: string }> {
  const existing = await prisma.staffUser.findUnique({ where: { id: userId } });

  // If 2FA is already confirmed, don't silently replace the working secret —
  // that would lock the user out without warning if they land back on this
  // page (e.g. via the browser back button) after finishing setup.
  let secret: string;
  if (existing?.totpEnabledAt && existing.totpSecretEnc) {
    secret = decrypt(existing.totpSecretEnc);
  } else {
    secret = generateTotpSecret();
    await prisma.staffUser.update({
      where: { id: userId },
      data: { totpSecretEnc: encrypt(secret) },
    });
  }

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
