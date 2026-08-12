import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { verifyTotpCode } from '@/lib/totp';
import { decrypt } from '@/lib/encryption';
import { isRateLimited } from '@/lib/rateLimit';

const MAX_ATTEMPTS_TO_FETCH = 10;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/painel/login' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        totpCode: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const totpCode = credentials?.totpCode as string | undefined;
        if (!email || !password) return null;

        const recentAttempts = await prisma.loginAttempt.findMany({
          where: { email },
          orderBy: { createdAt: 'desc' },
          take: MAX_ATTEMPTS_TO_FETCH,
        });
        if (isRateLimited(recentAttempts.map((a) => a.createdAt))) {
          throw new Error('RATE_LIMITED');
        }

        const user = await prisma.staffUser.findUnique({ where: { email } });
        const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

        if (!user || !passwordOk) {
          await prisma.loginAttempt.create({ data: { email } });
          throw new Error('CredentialsSignin');
        }

        const totpIsEnabled = Boolean(user.totpEnabledAt && user.totpSecretEnc);

        if (totpIsEnabled) {
          if (!totpCode) {
            throw new Error('TOTP_REQUIRED');
          }
          const secret = decrypt(user.totpSecretEnc as string);
          if (!verifyTotpCode(secret, totpCode)) {
            await prisma.loginAttempt.create({ data: { email } });
            throw new Error('TOTP_INVALID');
          }
        }

        return { id: user.id, email: user.email, totpEnabled: totpIsEnabled };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.totpEnabled = (user as { totpEnabled: boolean }).totpEnabled;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      (session as typeof session & { totpEnabled: boolean }).totpEnabled = token.totpEnabled as boolean;
      return session;
    },
  },
});
