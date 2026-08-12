import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './auth';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/painel')) {
    const isLoginPage = pathname === '/painel/login';
    const isTotpSetupPage = pathname === '/painel/totp-setup';
    const session = req.auth as (typeof req.auth & { totpEnabled?: boolean }) | null;

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/painel/login', req.url));
    }
    if (session && !session.totpEnabled && !isTotpSetupPage && !isLoginPage) {
      return NextResponse.redirect(new URL('/painel/totp-setup', req.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(req as Parameters<typeof intlMiddleware>[0]);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
  runtime: 'nodejs',
};
