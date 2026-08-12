import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { startTotpSetup } from '@/lib/totpSetup';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { qrCodeDataUrl } = await startTotpSetup(session.user.id, session.user.email);
  return NextResponse.json({ qrCodeDataUrl });
}
