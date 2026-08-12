import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { verifyTotpCode } from '@/lib/totp';
import { confirmTotpSetup } from '@/lib/totpSetup';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { code } = (await request.json()) as { code?: string };
  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 });
  }

  const user = await prisma.staffUser.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecretEnc) {
    return NextResponse.json({ error: 'setup_not_started' }, { status: 400 });
  }

  const secret = decrypt(user.totpSecretEnc);
  if (!verifyTotpCode(secret, code)) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }

  await confirmTotpSetup(session.user.id);
  return NextResponse.json({ ok: true });
}
