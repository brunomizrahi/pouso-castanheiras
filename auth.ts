import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { verifyTotpCode } from '@/lib/totp';
import { decrypt } from '@/lib/encryption';
import { isRateLimited } from '@/lib/rateLimit';

const MAX_ATTEMPTS_TO_FETCH = 10;

// NextAuth only forwards a thrown error's details to the client when it is
// (a subclass of) CredentialsSignin — anything else, including a plain
// `new Error('SOME_CODE')`, gets swallowed server-side and replaced with a
// generic "Configuration" error on the client. These subclasses set `.code`,
// which NextAuth puts in the client-visible `result.code` field, so the
// login form can actually tell these cases apart (see LoginForm.tsx).
class TotpRequiredError extends CredentialsSignin {
  code = 'TOTP_REQUIRED';
}
class TotpInvalidError extends CredentialsSignin {
  code = 'TOTP_INVALID';
}
class RateLimitedError extends CredentialsSignin {
  code = 'RATE_LIMITED';
}

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
          throw new RateLimitedError();
        }

        const user = await prisma.staffUser.findUnique({ where: { email } });
        const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

        if (!user || !passwordOk) {
          await prisma.loginAttempt.create({ data: { email } });
          throw new CredentialsSignin();
        }

        const totpIsEnabled = Boolean(user.totpEnabledAt && user.totpSecretEnc);

        if (totpIsEnabled) {
          if (!totpCode) {
            throw new TotpRequiredError();
          }
          const secret = decrypt(user.totpSecretEnc as string);
          if (!verifyTotpCode(secret, totpCode)) {
            await prisma.loginAttempt.create({ data: { email } });
            throw new TotpInvalidError();
          }
        }

        return { id: user.id, email: user.email, totpEnabled: totpIsEnabled };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.totpEnabled = (user as { totpEnabled: boolean }).totpEnabled;
      if (trigger === 'update' && token.sub) {
        const dbUser = await prisma.staffUser.findUnique({ where: { id: token.sub } });
        token.totpEnabled = Boolean(dbUser?.totpEnabledAt && dbUser?.totpSecretEnc);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      (session as typeof session & { totpEnabled: boolean }).totpEnabled = token.totpEnabled as boolean;
      return session;
    },
  },
});
