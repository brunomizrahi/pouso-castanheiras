# Painel Administrativo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working, password + TOTP-protected internal admin area (`/painel`) with a reservations calendar, manual reservation CRUD, transfer tracking, a financial (receivables/provisioning) view, and an editable rate table — running against a real Postgres database seeded with sample data, with no connection yet to Google Calendar or to the public site's `/tarifas` page.

**Architecture:** New sibling route tree `app/painel/` (outside the `[locale]` group — the panel is single-language and doesn't go through `next-intl`), backed by Neon Postgres via Prisma. Auth.js (NextAuth v5) with a Credentials provider handles login; a custom `authorize()` implements the two-step password → TOTP flow; `middleware.ts` is extended (not replaced) to guard `/painel/*` routes alongside the existing `next-intl` routing for the public site. Every piece of security-sensitive logic (password hashing, TOTP generation/verification, secret encryption, login rate limiting) and the financial math (receivables, provisioning) is extracted into pure, unit-tested functions before being wired into routes.

**Tech Stack:** Next.js App Router (existing project), Prisma + Neon Postgres, NextAuth v5 (`next-auth@beta`), `otplib` (TOTP), `qrcode` (QR rendering), `bcryptjs` (password hashing), Node's built-in `crypto` (AES-256-GCM secret encryption), Vitest (existing).

**Source of truth:** `docs/superpowers/specs/2026-08-11-painel-administrativo-design.md`.

---

## Project directory

`/Users/sciensa/Desktop/pouso-castanheiras` — the same Next.js project as the public site. All paths below are relative to this root unless stated otherwise.

## How to verify UI tasks

The panel doesn't need pixel fidelity to the marketing site, but every screen must actually work. For each UI task:
1. Run `npm run dev` and log in with the seeded test user (Task 26 creates it).
2. Exercise the exact flow described in the task's "Step: verify" — click through it, don't just eyeball the layout.
3. Check the browser console and terminal for errors.

---

## Phase 0 — Database

### Task 1: Install and configure Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (dependencies)
- Modify: `.env.local` (add `DATABASE_URL`)

- [ ] **Step 1: Install Prisma**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
npm install -D prisma
npm install @prisma/client
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and appends a `DATABASE_URL` placeholder to `.env.local` (or creates `.env` — if it creates `.env` instead of `.env.local`, move the `DATABASE_URL` line into `.env.local` and delete the generated `.env`, since this project keeps all secrets in the already-gitignored `.env.local`).

- [ ] **Step 2: Create a Neon Postgres database**

Go to [neon.tech](https://neon.tech), sign in (or create a free account), create a new project named `pouso-castanheiras`. Copy the connection string it gives you (starts with `postgresql://...`).

- [ ] **Step 3: Set `DATABASE_URL` in `.env.local`**

```
DATABASE_URL="postgresql://<the-connection-string-neon-gave-you>"
```

- [ ] **Step 4: Replace the contents of `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model StaffUser {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  totpSecretEnc String?
  totpEnabledAt DateTime?
  createdAt     DateTime  @default(now())

  reservations Reservation[]
}

model LoginAttempt {
  id        String   @id @default(uuid())
  email     String
  createdAt DateTime @default(now())

  @@index([email, createdAt])
}

model Package {
  id           String   @id @default(uuid())
  slug         String   @unique
  name         String
  description  String
  nights       Int?
  priceLow     Decimal  @db.Decimal(10, 2)
  priceHigh    Decimal  @db.Decimal(10, 2)
  priceSpecial Decimal? @db.Decimal(10, 2)
  active       Boolean  @default(true)
  updatedAt    DateTime @updatedAt

  reservations Reservation[]
}

enum ReservationSource {
  site
  manual
}

enum PaymentStatus {
  aguardando_sinal
  aguardando_pagamento
  pago
}

enum TransferStatus {
  organizado
  pendente
}

model Reservation {
  id                  String            @id @default(uuid())
  source              ReservationSource
  status              PaymentStatus
  checkIn             DateTime          @db.Date
  checkOut            DateTime          @db.Date
  guestName           String
  guestEmail          String?
  guestPhone          String
  packageId           String
  package             Package           @relation(fields: [packageId], references: [id])
  pax                 Int
  notes               String?
  totalValue          Decimal           @db.Decimal(10, 2)
  transferStatus      TransferStatus
  transferProvider    String?
  transferScheduledAt DateTime?
  transferNotes       String?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  deletedAt           DateTime?
  createdByUserId     String?
  createdByUser       StaffUser?        @relation(fields: [createdByUserId], references: [id])
}
```

- [ ] **Step 5: Run the initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: creates `prisma/migrations/`, prints `Your database is now in sync with your schema.`, and generates the Prisma Client into `node_modules/@prisma/client`.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations package.json package-lock.json
git commit -m "chore: add Prisma schema (StaffUser, LoginAttempt, Package, Reservation)"
```

`.env.local` is already gitignored — confirm it wasn't staged: `git status` should not list it.

---

### Task 2: Prisma client singleton

**Files:**
- Create: `lib/prisma.ts`

- [ ] **Step 1: Create the file**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

This is the standard Next.js dev-mode pattern — without it, every hot-reload in `npm run dev` would open a new database connection and eventually exhaust Neon's connection limit.

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/prisma.ts
git commit -m "chore: add Prisma client singleton"
```

---

## Phase 1 — Pure logic (TDD)

Every piece of security- or money-sensitive logic is a plain function before it's wired into a route or a form. This phase has no UI and no Prisma calls — just inputs and outputs.

### Task 3: Password hashing

**Files:**
- Create: `lib/password.ts`
- Test: `lib/password.test.ts`

- [ ] **Step 1: Install bcryptjs**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 2: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('hashPassword / verifyPassword', () => {
  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('correct-horse-battery-staple', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('produces a different hash each time (random salt)', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npx vitest run lib/password.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `lib/password.ts`**

```ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npx vitest run lib/password.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/password.ts lib/password.test.ts package.json package-lock.json
git commit -m "feat: add password hashing helpers"
```

---

### Task 4: TOTP secret encryption at rest

**Files:**
- Create: `lib/encryption.ts`
- Test: `lib/encryption.test.ts`

- [ ] **Step 1: Add the encryption key to `.env.local`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the printed value and add it to `.env.local`:

```
TOTP_ENCRYPTION_KEY="<the value you just generated>"
```

- [ ] **Step 2: Write the failing tests**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './encryption';

beforeAll(() => {
  process.env.TOTP_ENCRYPTION_KEY = 'test-key-for-vitest-only-not-a-real-secret';
});

describe('encrypt / decrypt', () => {
  it('round-trips a plain text value', () => {
    const original = 'JBSWY3DPEHPK3PXP';
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const original = 'JBSWY3DPEHPK3PXP';
    expect(encrypt(original)).not.toBe(encrypt(original));
  });

  it('throws when the payload has been tampered with', () => {
    const encrypted = encrypt('secret-value');
    const tampered = encrypted.slice(0, -2) + '00';
    expect(() => decrypt(tampered)).toThrow();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npx vitest run lib/encryption.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `lib/encryption.ts`**

```ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function deriveKey(): Buffer {
  const secret = process.env.TOTP_ENCRYPTION_KEY;
  if (!secret) throw new Error('TOTP_ENCRYPTION_KEY is not set');
  return scryptSync(secret, 'painel-totp-salt', 32);
}

export function encrypt(plainText: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(payload: string): string {
  const [ivHex, authTagHex, encryptedHex] = payload.split(':');
  const key = deriveKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npx vitest run lib/encryption.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/encryption.ts lib/encryption.test.ts
git commit -m "feat: add AES-256-GCM encryption for TOTP secrets at rest"
```

(`.env.local`'s new `TOTP_ENCRYPTION_KEY` line is not committed — it's gitignored, same as `DATABASE_URL`.)

---

### Task 5: TOTP generation and verification

**Files:**
- Create: `lib/totp.ts`
- Test: `lib/totp.test.ts`

- [ ] **Step 1: Install otplib**

```bash
npm install otplib
```

- [ ] **Step 2: Write the failing tests**

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npx vitest run lib/totp.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `lib/totp.ts`**

```ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npx vitest run lib/totp.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/totp.ts lib/totp.test.ts package.json package-lock.json
git commit -m "feat: add TOTP generation and verification"
```

---

### Task 6: Login rate limiting

**Files:**
- Create: `lib/rateLimit.ts`
- Test: `lib/rateLimit.test.ts`

Ported as a pure decision function — given a list of recent failed-attempt timestamps for an email, decide whether to block. The actual database query (fetching those timestamps) is wired in later, in Task 9.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { isRateLimited, MAX_ATTEMPTS } from './rateLimit';

describe('isRateLimited', () => {
  const now = new Date('2026-08-11T12:00:00Z');

  it('allows login when there are fewer than MAX_ATTEMPTS recent failures', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS - 1 }, () => new Date(now.getTime() - 60_000));
    expect(isRateLimited(attempts, now)).toBe(false);
  });

  it('blocks login at MAX_ATTEMPTS recent failures', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS }, () => new Date(now.getTime() - 60_000));
    expect(isRateLimited(attempts, now)).toBe(true);
  });

  it('ignores attempts older than the 15-minute window', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS }, () => new Date(now.getTime() - 20 * 60_000));
    expect(isRateLimited(attempts, now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/rateLimit.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/rateLimit.ts`**

```ts
export const MAX_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

export function isRateLimited(recentAttemptTimestamps: Date[], now: Date = new Date()): boolean {
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
  const attemptsInWindow = recentAttemptTimestamps.filter((t) => t >= windowStart);
  return attemptsInWindow.length >= MAX_ATTEMPTS;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/rateLimit.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/rateLimit.ts lib/rateLimit.test.ts
git commit -m "feat: add login rate-limiting decision logic"
```

---

### Task 7: Financial calculations

**Files:**
- Create: `lib/finance.ts`
- Test: `lib/finance.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { calculateReceivables, calculateProvisioning, type ReservationForFinance } from './finance';

const sample: ReservationForFinance[] = [
  { id: '1', checkIn: '2026-09-10', totalValue: 21400, status: 'pago' },
  { id: '2', checkIn: '2026-09-15', totalValue: 37500, status: 'aguardando_sinal' },
  { id: '3', checkIn: '2026-10-02', totalValue: 29000, status: 'aguardando_pagamento' },
];

describe('calculateReceivables', () => {
  it('sums only reservations that are not fully paid', () => {
    const result = calculateReceivables(sample);
    expect(result.total).toBe(37500 + 29000);
    expect(result.items).toHaveLength(2);
  });

  it('returns zero for an empty list', () => {
    expect(calculateReceivables([])).toEqual({ total: 0, items: [] });
  });
});

describe('calculateProvisioning', () => {
  it('sums reservations whose check-in falls in the given month, split by status', () => {
    const result = calculateProvisioning(sample, { type: 'month', year: 2026, month: 9 });
    expect(result.total).toBe(21400 + 37500);
    expect(result.byStatus.pago).toBe(21400);
    expect(result.byStatus.aguardando_sinal).toBe(37500);
    expect(result.byStatus.aguardando_pagamento).toBe(0);
  });

  it('excludes reservations outside the given month', () => {
    const result = calculateProvisioning(sample, { type: 'month', year: 2026, month: 10 });
    expect(result.total).toBe(29000);
  });

  it('sums reservations for one specific day', () => {
    const result = calculateProvisioning(sample, { type: 'day', date: '2026-09-10' });
    expect(result.total).toBe(21400);
  });

  it('returns zero when nothing matches the period', () => {
    const result = calculateProvisioning(sample, { type: 'day', date: '2026-12-25' });
    expect(result.total).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/finance.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/finance.ts`**

```ts
export type FinancePaymentStatus = 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';

export interface ReservationForFinance {
  id: string;
  checkIn: string; // ISO date, 'YYYY-MM-DD'
  totalValue: number;
  status: FinancePaymentStatus;
}

export interface ReceivableSummary {
  total: number;
  items: ReservationForFinance[];
}

export function calculateReceivables(reservations: ReservationForFinance[]): ReceivableSummary {
  const items = reservations.filter((r) => r.status !== 'pago');
  const total = items.reduce((sum, r) => sum + r.totalValue, 0);
  return { total, items };
}

export type Period = { type: 'month'; year: number; month: number } | { type: 'day'; date: string };

export interface ProvisioningSummary {
  total: number;
  byStatus: Record<FinancePaymentStatus, number>;
}

function isInPeriod(checkInIso: string, period: Period): boolean {
  if (period.type === 'day') return checkInIso === period.date;
  const [year, month] = checkInIso.split('-').map(Number);
  return year === period.year && month === period.month;
}

export function calculateProvisioning(
  reservations: ReservationForFinance[],
  period: Period
): ProvisioningSummary {
  const inPeriod = reservations.filter((r) => isInPeriod(r.checkIn, period));
  const byStatus: Record<FinancePaymentStatus, number> = {
    aguardando_sinal: 0,
    aguardando_pagamento: 0,
    pago: 0,
  };
  for (const r of inPeriod) byStatus[r.status] += r.totalValue;
  const total = inPeriod.reduce((sum, r) => sum + r.totalValue, 0);
  return { total, byStatus };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/finance.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Run the full test suite before moving to auth wiring**

```bash
npm run test
```

Expected: all `lib/*.test.ts` files pass (the site's existing 43 tests plus this phase's password/encryption/totp/rateLimit/finance tests).

- [ ] **Step 6: Commit**

```bash
git add lib/finance.ts lib/finance.test.ts
git commit -m "feat: add receivables and provisioning calculations"
```

---

## Phase 2 — Authentication

### Task 8: NextAuth configuration and the two-step authorize() flow

**Files:**
- Create: `auth.ts` (project root)
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `.env.local` (add `AUTH_SECRET`)

- [ ] **Step 1: Install NextAuth v5**

```bash
npm install next-auth@beta
```

- [ ] **Step 2: Generate the auth secret**

```bash
npx auth secret
```

This writes `AUTH_SECRET` into `.env.local` automatically. If it doesn't (older CLI versions print the value instead), add it yourself:

```
AUTH_SECRET="<the printed value>"
```

- [ ] **Step 3: Create `auth.ts` at the project root**

```ts
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
      (session as typeof session & { totpEnabled: boolean }).totpEnabled = token.totpEnabled as boolean;
      return session;
    },
  },
});
```

- [ ] **Step 4: Create the route handler**

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '@/auth';
```

Wait — `auth.ts` exports `handlers`, not `GET`/`POST` directly. Use this instead:

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 5: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add auth.ts app/api/auth
git commit -m "feat: configure NextAuth with password + TOTP two-step authorize()"
```

`authorize()` itself isn't unit tested here — it's a thin composition of the already-tested `verifyPassword`, `verifyTotpCode`, `decrypt`, and `isRateLimited`, plus Prisma calls. It's covered by the manual end-to-end login test in Task 26.

---

### Task 9: Middleware — guard `/painel` alongside the existing `next-intl` routing

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Read the current file to confirm its exact contents before editing**

```bash
cat middleware.ts
```

Expected to see the `next-intl` middleware from the site's Task 18 (createMiddleware(routing), same matcher as below).

- [ ] **Step 2: Replace the contents of `middleware.ts`**

```ts
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
};
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If `req as Parameters<typeof intlMiddleware>[0]` errors on your installed `next-intl`/`next-auth` versions, use `req as never` instead — the runtime behavior (passing the same request object through) is what matters, not the cast.

- [ ] **Step 4: Verify the public site still works**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "home: %{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "reserva: %{http_code}\n" http://localhost:3000/reserva
curl -s -o /dev/null -w "painel (no session, should redirect): %{http_code}\n" -L http://localhost:3000/painel
kill %1
```

Expected: `home: 200`, `reserva: 200`, and the `/painel` request follows a redirect to `/painel/login` (curl with `-L` should end at `200` on the login page once Task 12 creates it — until then it'll 404 after redirecting, which is expected at this point in the plan).

- [ ] **Step 5: Commit**

```bash
git add middleware.ts
git commit -m "feat: guard /painel routes in middleware alongside next-intl routing"
```

---

### Task 10: Panel layout shell (unauthenticated wrapper)

**Files:**
- Create: `app/painel/layout.tsx`
- Create: `app/painel/painel.module.css` (shared minimal reset, imported once here)

This is the outermost layout for everything under `/painel` — it does NOT include the sidebar (that's Task 13's job, scoped to the authenticated screens only). It just sets up the HTML shell and pulls in the site's color tokens.

- [ ] **Step 1: Create `app/painel/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import '../globals.css';
import './painel.module.css';

export const metadata: Metadata = {
  title: 'Painel — Pouso das Castanheiras',
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/painel/painel.module.css`**

```css
:global(.painel) {
  --panel-bg: var(--bg-primary);
  --panel-ink: var(--ink);
  --panel-border: var(--sand);
  color: var(--panel-ink);
  background: var(--panel-bg);
  min-height: 100vh;
}
```

Note: `app/painel/layout.tsx` renders its own `<html>`/`<body>` because it's a sibling root layout to `app/[locale]/layout.tsx` and `app/layout.tsx` (the true root) is just a passthrough — Next.js requires exactly one `<html>`/`<body>` per rendered tree, and `/painel` routes never render through `app/[locale]/layout.tsx`, so this is the only place they get one.

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/painel/layout.tsx app/painel/painel.module.css
git commit -m "feat: add unauthenticated panel layout shell"
```

---

### Task 11: TOTP setup helper functions wired to Prisma

**Files:**
- Create: `lib/totpSetup.ts`

Thin Prisma-calling wrappers around the pure `lib/totp.ts` and `lib/encryption.ts` functions — kept separate from the pure-logic files so those stay dependency-free and easy to unit test.

- [ ] **Step 1: Create the file**

```ts
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
```

- [ ] **Step 2: Install qrcode**

```bash
npm install qrcode
npm install -D @types/qrcode
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/totpSetup.ts package.json package-lock.json
git commit -m "feat: add TOTP setup helpers (QR generation, secret storage)"
```

---

### Task 12: Login page

**Files:**
- Create: `app/painel/login/page.tsx`
- Create: `app/painel/login/LoginForm.tsx`
- Create: `app/painel/login/login.module.css`

Two-step client-side form: step 1 collects e-mail + senha; if `signIn()` responds with the `TOTP_REQUIRED` error, the form switches to step 2 (asking for the 6-digit code) while keeping the e-mail/senha already typed, and resubmits all three together.

- [ ] **Step 1: Create `app/painel/login/login.module.css`**

```css
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 360px;
  border: 1px solid var(--sand);
  border-radius: var(--radius);
  padding: 32px;
  background: #fff;
}

.title {
  font-family: var(--font-petrona), serif;
  font-size: 24px;
  margin: 0 0 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field label {
  font-size: 12px;
  color: var(--text-secondary);
}

.field input {
  padding: 10px 12px;
  border: 1px solid var(--sand);
  border-radius: 4px;
  font-size: 15px;
}

.error {
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 16px;
}

.submit {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--ink);
  color: var(--bg-primary);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.submit:disabled {
  opacity: 0.6;
  cursor: default;
}
```

- [ ] **Step 2: Create `app/painel/login/LoginForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'totp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      totpCode: step === 'totp' ? totpCode : undefined,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error === 'TOTP_REQUIRED') {
      setStep('totp');
      return;
    }
    if (result?.error === 'TOTP_INVALID') {
      setError('Código incorreto. Tente novamente.');
      return;
    }
    if (result?.error === 'RATE_LIMITED') {
      setError('Muitas tentativas. Aguarde 15 minutos e tente de novo.');
      return;
    }
    if (result?.error) {
      setError('E-mail ou senha incorretos.');
      return;
    }
    router.push('/painel');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h1 className={styles.title}>Painel — Pouso das Castanheiras</h1>
      {error && <div className={styles.error}>{error}</div>}

      {step === 'password' && (
        <>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </>
      )}

      {step === 'totp' && (
        <div className={styles.field}>
          <label htmlFor="totpCode">Código do app autenticador</label>
          <input
            id="totpCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Entrando…' : step === 'password' ? 'Continuar' : 'Entrar'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/painel/login/page.tsx`**

```tsx
import { LoginForm } from './LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.wrap}>
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/painel/login
git commit -m "feat: build panel login page with two-step password/TOTP form"
```

---

### Task 13: Forced TOTP setup page

**Files:**
- Create: `app/painel/totp-setup/page.tsx`
- Create: `app/painel/totp-setup/TotpSetupForm.tsx`
- Create: `app/api/painel/totp-setup/start/route.ts`
- Create: `app/api/painel/totp-setup/confirm/route.ts`

Reached automatically by the middleware (Task 9) whenever a logged-in session has `totpEnabled: false`. Shows the QR code once, then asks the user to type the current code from their authenticator app to confirm the pairing worked before letting them into the rest of the panel.

- [ ] **Step 1: Create `app/api/painel/totp-setup/start/route.ts`**

```ts
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
```

- [ ] **Step 2: Create `app/api/painel/totp-setup/confirm/route.ts`**

```ts
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
```

- [ ] **Step 3: Create `app/painel/totp-setup/TotpSetupForm.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export function TotpSetupForm() {
  const router = useRouter();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/painel/totp-setup/start', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setQrCodeDataUrl(data.qrCodeDataUrl));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/painel/totp-setup/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError('Código incorreto. Confira o app autenticador e tente de novo.');
      return;
    }
    router.push('/painel');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <h1 className={styles.title}>Configure a verificação em duas etapas</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Escaneie o código abaixo com o Google Authenticator, Authy ou app similar, depois digite o
        código de 6 dígitos gerado.
      </p>
      {qrCodeDataUrl && (
        <img src={qrCodeDataUrl} alt="QR code para configurar o autenticador" style={{ display: 'block', margin: '0 auto 20px' }} />
      )}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.field}>
        <label htmlFor="code">Código de 6 dígitos</label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submit} disabled={submitting || !qrCodeDataUrl}>
        {submitting ? 'Confirmando…' : 'Confirmar'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create `app/painel/totp-setup/page.tsx`**

```tsx
import { TotpSetupForm } from './TotpSetupForm';
import styles from '../login/login.module.css';

export default function TotpSetupPage() {
  return (
    <div className={styles.wrap}>
      <TotpSetupForm />
    </div>
  );
}
```

- [ ] **Step 5: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/painel/totp-setup app/api/painel/totp-setup
git commit -m "feat: build forced TOTP setup flow (QR code + confirmation)"
```

---

### Task 14: Sidebar shell for authenticated screens

**Files:**
- Create: `app/painel/(app)/layout.tsx`
- Create: `app/painel/(app)/Sidebar.tsx`
- Create: `app/painel/(app)/sidebar.module.css`

This wraps only the authenticated screens (dashboard, calendário, reservas, financeiro, tarifário) — `/painel/login` and `/painel/totp-setup` sit outside this route group and never show the sidebar. Matches the "menu lateral fixo" layout validated with the client during brainstorming.

- [ ] **Step 1: Create `app/painel/(app)/sidebar.module.css`**

```css
.shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--ink);
  color: var(--bg-primary);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.brand {
  font-family: var(--font-petrona), serif;
  font-size: 16px;
  margin-bottom: 32px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.navLink {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 14px;
}

.navLink:hover {
  background: rgba(251, 249, 245, 0.08);
}

.navLinkActive {
  background: rgba(251, 249, 245, 0.14);
  font-weight: 600;
}

.badge {
  background: #c0392b;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
}

.userRow {
  border-top: 1px solid rgba(251, 249, 245, 0.14);
  padding-top: 16px;
  margin-top: 16px;
  font-size: 13px;
}

.logoutButton {
  background: none;
  border: 0;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
  margin-top: 8px;
}

.main {
  flex: 1;
  padding: 32px 40px;
  overflow-x: auto;
}
```

- [ ] **Step 2: Create `app/painel/(app)/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './sidebar.module.css';

const NAV_ITEMS = [
  { href: '/painel', label: 'Visão geral' },
  { href: '/painel/calendario', label: 'Calendário' },
  { href: '/painel/reservas', label: 'Reservas' },
  { href: '/painel/financeiro', label: 'Financeiro' },
  { href: '/painel/tarifario', label: 'Tarifário' },
] as const;

export function Sidebar({ userEmail, pendingCount }: { userEmail: string; pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Pouso das Castanheiras</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
          >
            <span>{item.label}</span>
            {item.href === '/painel/reservas' && pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className={styles.userRow}>
        <div>{userEmail}</div>
        <button type="button" className={styles.logoutButton} onClick={() => signOut({ callbackUrl: '/painel/login' })}>
          Sair
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create `app/painel/(app)/layout.tsx`**

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from './Sidebar';
import styles from './sidebar.module.css';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const pendingCount = await prisma.reservation.count({
    where: { status: { in: ['aguardando_sinal', 'aguardando_pagamento'] }, deletedAt: null },
  });

  return (
    <div className={styles.shell}>
      <Sidebar userEmail={session?.user?.email ?? ''} pendingCount={pendingCount} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/painel/(app)/layout.tsx" "app/painel/(app)/Sidebar.tsx" "app/painel/(app)/sidebar.module.css"
git commit -m "feat: build sidebar shell for authenticated panel screens"
```

---

## Phase 3 — Screens

Every screen in this phase lives under `app/painel/(app)/` and is only reachable once logged in with 2FA confirmed (enforced by Task 9's middleware). None of them have real data yet — that's Task 25 (seed).

### Task 15: Visão Geral (dashboard)

**Files:**
- Create: `app/painel/(app)/page.tsx`
- Create: `app/painel/(app)/dashboard.module.css`

- [ ] **Step 1: Create `app/painel/(app)/dashboard.module.css`**

```css
.cards {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  border: 1px solid var(--sand);
  border-radius: var(--radius);
  padding: 20px 24px;
  background: #fff;
  min-width: 200px;
}

.cardLabel {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.cardValue {
  font-family: var(--font-petrona), serif;
  font-size: 28px;
}

.sectionTitle {
  font-family: var(--font-petrona), serif;
  font-size: 20px;
  margin-bottom: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--sand);
  font-size: 14px;
}

.table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.empty {
  color: var(--text-tertiary);
  font-size: 14px;
  padding: 16px 0;
}
```

- [ ] **Step 2: Create `app/painel/(app)/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma';
import { calculateReceivables } from '@/lib/finance';
import styles from './dashboard.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [reservationsThisMonth, allActive] = await Promise.all([
    prisma.reservation.count({
      where: { checkIn: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
    }),
    prisma.reservation.findMany({
      where: { deletedAt: null },
      include: { package: true },
      orderBy: { checkIn: 'asc' },
    }),
  ]);

  const receivables = calculateReceivables(
    allActive.map((r) => ({
      id: r.id,
      checkIn: r.checkIn.toISOString().slice(0, 10),
      totalValue: Number(r.totalValue),
      status: r.status,
    }))
  );

  const pending = allActive.filter((r) => r.status !== 'pago');

  return (
    <div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Reservas este mês</div>
          <div className={styles.cardValue}>{reservationsThisMonth}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Valores a receber</div>
          <div className={styles.cardValue}>{formatBRL(receivables.total)}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Pagamentos pendentes</h2>
      {pending.length === 0 ? (
        <p className={styles.empty}>Nenhuma reserva com pagamento pendente.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hóspede</th>
              <th>Check-in</th>
              <th>Pacote</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>{r.guestName}</td>
                <td>{formatDate(r.checkIn)}</td>
                <td>{r.package.name}</td>
                <td>{r.status === 'aguardando_sinal' ? 'Aguardando sinal' : 'Aguardando pagamento'}</td>
                <td>{formatBRL(Number(r.totalValue))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/painel/(app)/page.tsx" "app/painel/(app)/dashboard.module.css"
git commit -m "feat: build Visão Geral dashboard screen"
```

---

### Task 16: Calendar month-grid logic (reused from the site)

**Files:**
- Create: `lib/panelCalendar.ts`
- Test: `lib/panelCalendar.test.ts`

The site's `lib/calendar.ts` (`buildMonth`) renders a month grid keyed off a check-in/check-out *range* for the reservation form — the panel needs a different shape: a month grid where each day carries whichever reservation (if any) covers it, so the calendar screen can color it by that reservation's `status`. This is a distinct function, not a reuse of `buildMonth`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { buildPanelMonth, type PanelReservation } from './panelCalendar';

const reservations: PanelReservation[] = [
  { id: 'a', checkIn: '2026-09-10', checkOut: '2026-09-13', status: 'pago' },
  { id: 'b', checkIn: '2026-09-20', checkOut: '2026-09-22', status: 'aguardando_sinal' },
];

describe('buildPanelMonth', () => {
  it('labels the month and pads leading empty cells for the weekday offset', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations); // September 2026
    expect(month.label).toBe('Setembro 2026');
    // Sept 1 2026 is a Tuesday: 2 empty cells before day 1, then 30 days.
    expect(month.days).toHaveLength(2 + 30);
  });

  it('assigns the covering reservation to each day inside its range', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const day11 = month.days.find((d) => d.iso === '2026-09-11');
    expect(day11?.reservation?.id).toBe('a');
    expect(day11?.reservation?.status).toBe('pago');
  });

  it('leaves days with no covering reservation as available', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const day16 = month.days.find((d) => d.iso === '2026-09-16');
    expect(day16?.reservation).toBeNull();
  });

  it('treats check-out day as not covered (guest has left)', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const checkoutDay = month.days.find((d) => d.iso === '2026-09-13');
    expect(checkoutDay?.reservation).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/panelCalendar.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/panelCalendar.ts`**

```ts
export type PanelPaymentStatus = 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';

export interface PanelReservation {
  id: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  status: PanelPaymentStatus;
}

export interface PanelCalendarDay {
  day: string;
  iso: string | null;
  reservation: PanelReservation | null;
}

export interface PanelCalendarMonth {
  label: string;
  days: PanelCalendarDay[];
}

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function iso(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function buildPanelMonth(base: Date, reservations: PanelReservation[]): PanelCalendarMonth {
  const y = base.getFullYear();
  const m = base.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();

  const days: PanelCalendarDay[] = [];
  for (let i = 0; i < startDow; i++) {
    days.push({ day: '', iso: null, reservation: null });
  }
  for (let d = 1; d <= daysIn; d++) {
    const s = iso(new Date(y, m, d));
    const covering = reservations.find((r) => s >= r.checkIn && s < r.checkOut) ?? null;
    days.push({ day: String(d), iso: s, reservation: covering });
  }

  return { label: MONTH_LABELS[m] + ' ' + y, days };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/panelCalendar.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/panelCalendar.ts lib/panelCalendar.test.ts
git commit -m "feat: add panel calendar month-grid logic keyed by reservation status"
```

---

### Task 17: Calendar screen

**Files:**
- Create: `app/painel/(app)/calendario/page.tsx`
- Create: `app/painel/(app)/calendario/CalendarView.tsx`
- Create: `app/painel/(app)/calendario/calendar.module.css`

- [ ] **Step 1: Create `app/painel/(app)/calendario/calendar.module.css`**

```css
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.navButton {
  border: 1px solid var(--sand);
  background: #fff;
  border-radius: var(--radius-pill);
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.monthLabel {
  font-family: var(--font-petrona), serif;
  font-size: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday {
  text-align: center;
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 6px 0;
}

.day {
  min-height: 64px;
  border-radius: 3px;
  border: 1px solid #eee;
  padding: 6px;
  font-size: 13px;
}

.dayEmpty {
  border: 0;
}

.dayPago {
  border-left: 4px solid #2f6d4f;
  background: #f7faf8;
}

.dayAguardandoSinal {
  border-left: 4px solid #e0a53a;
  background: #fdf8f0;
}

.dayAguardandoPagamento {
  border-left: 4px solid #c0392b;
  background: #fdf3f2;
}

.legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  font-size: 12px;
}

.legendSwatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
}
```

- [ ] **Step 2: Create `app/painel/(app)/calendario/CalendarView.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildPanelMonth, type PanelReservation } from '@/lib/panelCalendar';
import styles from './calendar.module.css';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const STATUS_CLASS: Record<string, string> = {
  pago: styles.dayPago,
  aguardando_sinal: styles.dayAguardandoSinal,
  aguardando_pagamento: styles.dayAguardandoPagamento,
};

export function CalendarView({ reservations }: { reservations: PanelReservation[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const month = buildPanelMonth(base, reservations);

  return (
    <div>
      <div className={styles.nav}>
        <button type="button" className={styles.navButton} onClick={() => setMonthOffset((o) => o - 1)}>
          ‹
        </button>
        <div className={styles.monthLabel}>{month.label}</div>
        <button type="button" className={styles.navButton} onClick={() => setMonthOffset((o) => o + 1)}>
          ›
        </button>
      </div>
      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className={styles.weekday}>
            {w}
          </div>
        ))}
        {month.days.map((d, i) =>
          d.iso === null ? (
            <div key={i} className={`${styles.day} ${styles.dayEmpty}`} />
          ) : (
            <div
              key={i}
              className={`${styles.day} ${d.reservation ? STATUS_CLASS[d.reservation.status] : ''}`}
            >
              <div>{d.day}</div>
              {d.reservation && (
                <Link href={`/painel/reservas/${d.reservation.id}`} style={{ fontSize: 11 }}>
                  ver reserva
                </Link>
              )}
            </div>
          )
        )}
      </div>
      <div className={styles.legend}>
        <span><span className={styles.legendSwatch} style={{ background: '#2f6d4f' }} />Pago</span>
        <span><span className={styles.legendSwatch} style={{ background: '#e0a53a' }} />Aguardando sinal</span>
        <span><span className={styles.legendSwatch} style={{ background: '#c0392b' }} />Aguardando pagamento</span>
        <span><span className={styles.legendSwatch} style={{ border: '1px solid #ddd' }} />Disponível</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/painel/(app)/calendario/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma';
import { CalendarView } from './CalendarView';

export default async function CalendarioPage() {
  const reservations = await prisma.reservation.findMany({
    where: { deletedAt: null },
    select: { id: true, checkIn: true, checkOut: true, status: true },
  });

  return (
    <CalendarView
      reservations={reservations.map((r) => ({
        id: r.id,
        checkIn: r.checkIn.toISOString().slice(0, 10),
        checkOut: r.checkOut.toISOString().slice(0, 10),
        status: r.status,
      }))}
    />
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/painel/(app)/calendario"
git commit -m "feat: build calendar screen with payment-status color coding"
```

---

### Task 18: Reservas — list with search

**Files:**
- Create: `app/painel/(app)/reservas/page.tsx`
- Create: `app/painel/(app)/reservas/reservas.module.css`

- [ ] **Step 1: Create `app/painel/(app)/reservas/reservas.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-family: var(--font-petrona), serif;
  font-size: 24px;
}

.newButton {
  background: var(--ink);
  color: var(--bg-primary);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  text-decoration: none;
  font-size: 13px;
}

.searchForm {
  margin-bottom: 20px;
}

.searchInput {
  padding: 8px 12px;
  border: 1px solid var(--sand);
  border-radius: 4px;
  width: 280px;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--sand);
  font-size: 14px;
}

.table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.table tr:hover {
  background: var(--bg-alt);
}

.rowLink {
  color: inherit;
  text-decoration: none;
  display: block;
}
```

- [ ] **Step 2: Create `app/painel/(app)/reservas/page.tsx`**

```tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './reservas.module.css';

const STATUS_LABEL: Record<string, string> = {
  aguardando_sinal: 'Aguardando sinal',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
};

const TRANSFER_LABEL: Record<string, string> = {
  organizado: 'Organizado',
  pendente: 'Pendente',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const reservations = await prisma.reservation.findMany({
    where: {
      deletedAt: null,
      ...(q ? { guestName: { contains: q, mode: 'insensitive' } } : {}),
    },
    include: { package: true },
    orderBy: { checkIn: 'desc' },
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservas</h1>
        <Link href="/painel/reservas/nova" className={styles.newButton}>
          Nova reserva
        </Link>
      </div>

      <form className={styles.searchForm} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por hóspede…"
          className={styles.searchInput}
        />
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hóspede</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Pacote</th>
            <th>Pagamento</th>
            <th>Traslado</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/painel/reservas/${r.id}`} className={styles.rowLink}>
                  {r.guestName}
                </Link>
              </td>
              <td>{formatDate(r.checkIn)}</td>
              <td>{formatDate(r.checkOut)}</td>
              <td>{r.package.name}</td>
              <td>{STATUS_LABEL[r.status]}</td>
              <td>{TRANSFER_LABEL[r.transferStatus]}</td>
              <td>{formatBRL(Number(r.totalValue))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/painel/(app)/reservas/page.tsx" "app/painel/(app)/reservas/reservas.module.css"
git commit -m "feat: build reservations list with guest-name search"
```

---

### Task 19: Reservas — shared form component

**Files:**
- Create: `app/painel/(app)/reservas/ReservationForm.tsx`
- Create: `app/painel/(app)/reservas/form.module.css`
- Create: `app/painel/(app)/reservas/actions.ts`

One form component shared by "Nova reserva" (Task 20) and "Editar reserva" (Task 21), covering every field from the spec: hóspede, período, pacote, hóspedes, valor, status de pagamento, and the transfer block (status, fornecedor, horário combinado, observações).

- [ ] **Step 1: Create `app/painel/(app)/reservas/form.module.css`**

```css
.form {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 16px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  color: var(--text-secondary);
}

.field input,
.field select,
.field textarea {
  padding: 10px 12px;
  border: 1px solid var(--sand);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.sectionTitle {
  font-family: var(--font-petrona), serif;
  font-size: 16px;
  margin-top: 12px;
}

.submit {
  align-self: flex-start;
  padding: 12px 28px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--ink);
  color: var(--bg-primary);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
```

- [ ] **Step 2: Create `app/painel/(app)/reservas/actions.ts`**

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export interface ReservationFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  packageId: string;
  pax: number;
  totalValue: number;
  status: 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';
  notes: string;
  transferStatus: 'organizado' | 'pendente';
  transferProvider: string;
  transferScheduledAt: string;
  transferNotes: string;
}

function parseFormData(formData: FormData): ReservationFormData {
  return {
    guestName: String(formData.get('guestName') ?? ''),
    guestEmail: String(formData.get('guestEmail') ?? ''),
    guestPhone: String(formData.get('guestPhone') ?? ''),
    checkIn: String(formData.get('checkIn') ?? ''),
    checkOut: String(formData.get('checkOut') ?? ''),
    packageId: String(formData.get('packageId') ?? ''),
    pax: Number(formData.get('pax') ?? 1),
    totalValue: Number(formData.get('totalValue') ?? 0),
    status: String(formData.get('status') ?? 'aguardando_sinal') as ReservationFormData['status'],
    notes: String(formData.get('notes') ?? ''),
    transferStatus: String(formData.get('transferStatus') ?? 'pendente') as ReservationFormData['transferStatus'],
    transferProvider: String(formData.get('transferProvider') ?? ''),
    transferScheduledAt: String(formData.get('transferScheduledAt') ?? ''),
    transferNotes: String(formData.get('transferNotes') ?? ''),
  };
}

export async function createReservation(formData: FormData) {
  const session = await auth();
  const data = parseFormData(formData);

  await prisma.reservation.create({
    data: {
      source: 'manual',
      status: data.status,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone,
      packageId: data.packageId,
      pax: data.pax,
      notes: data.notes || null,
      totalValue: data.totalValue,
      transferStatus: data.transferStatus,
      transferProvider: data.transferProvider || null,
      transferScheduledAt: data.transferScheduledAt ? new Date(data.transferScheduledAt) : null,
      transferNotes: data.transferNotes || null,
      createdByUserId: session?.user?.id ?? null,
    },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}

export async function updateReservation(id: string, formData: FormData) {
  const data = parseFormData(formData);

  await prisma.reservation.update({
    where: { id },
    data: {
      status: data.status,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone,
      packageId: data.packageId,
      pax: data.pax,
      notes: data.notes || null,
      totalValue: data.totalValue,
      transferStatus: data.transferStatus,
      transferProvider: data.transferProvider || null,
      transferScheduledAt: data.transferScheduledAt ? new Date(data.transferScheduledAt) : null,
      transferNotes: data.transferNotes || null,
    },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}

export async function deleteReservation(id: string) {
  await prisma.reservation.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}
```

- [ ] **Step 3: Create `app/painel/(app)/reservas/ReservationForm.tsx`**

```tsx
import styles from './form.module.css';

export interface ReservationFormValues {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  packageId?: string;
  pax?: number;
  totalValue?: number;
  status?: string;
  notes?: string;
  transferStatus?: string;
  transferProvider?: string;
  transferScheduledAt?: string;
  transferNotes?: string;
}

export function ReservationForm({
  action,
  packages,
  initialValues,
}: {
  action: (formData: FormData) => void;
  packages: { id: string; name: string }[];
  initialValues?: ReservationFormValues;
}) {
  const v = initialValues ?? {};
  return (
    <form action={action} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="guestName">Nome do hóspede</label>
          <input id="guestName" name="guestName" required defaultValue={v.guestName} />
        </div>
        <div className={styles.field}>
          <label htmlFor="guestPhone">Telefone</label>
          <input id="guestPhone" name="guestPhone" required defaultValue={v.guestPhone} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="guestEmail">E-mail (opcional)</label>
        <input id="guestEmail" name="guestEmail" type="email" defaultValue={v.guestEmail} />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="checkIn">Check-in</label>
          <input id="checkIn" name="checkIn" type="date" required defaultValue={v.checkIn} />
        </div>
        <div className={styles.field}>
          <label htmlFor="checkOut">Check-out</label>
          <input id="checkOut" name="checkOut" type="date" required defaultValue={v.checkOut} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="packageId">Pacote</label>
          <select id="packageId" name="packageId" required defaultValue={v.packageId}>
            <option value="" disabled>
              Selecione
            </option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="pax">Hóspedes</label>
          <input id="pax" name="pax" type="number" min={1} max={6} required defaultValue={v.pax ?? 4} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="totalValue">Valor total (R$)</label>
          <input
            id="totalValue"
            name="totalValue"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={v.totalValue}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="status">Status de pagamento</label>
          <select id="status" name="status" required defaultValue={v.status ?? 'aguardando_sinal'}>
            <option value="aguardando_sinal">Aguardando sinal</option>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="pago">Pago</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes">Observações</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={v.notes} />
      </div>

      <h2 className={styles.sectionTitle}>Traslado</h2>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="transferStatus">Status do traslado</label>
          <select id="transferStatus" name="transferStatus" required defaultValue={v.transferStatus ?? 'pendente'}>
            <option value="pendente">Pendente</option>
            <option value="organizado">Organizado</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="transferProvider">Fornecedor contratado</label>
          <input id="transferProvider" name="transferProvider" defaultValue={v.transferProvider} placeholder="Ex.: Táxi da cooperativa" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="transferScheduledAt">Horário combinado</label>
        <input id="transferScheduledAt" name="transferScheduledAt" type="datetime-local" defaultValue={v.transferScheduledAt} />
      </div>

      <div className={styles.field}>
        <label htmlFor="transferNotes">Observações do traslado</label>
        <textarea id="transferNotes" name="transferNotes" rows={2} defaultValue={v.transferNotes} />
      </div>

      <button type="submit" className={styles.submit}>
        Salvar
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/painel/(app)/reservas/ReservationForm.tsx" "app/painel/(app)/reservas/form.module.css" "app/painel/(app)/reservas/actions.ts"
git commit -m "feat: build shared reservation form component and server actions"
```

---

### Task 20: Reservas — nova reserva

**Files:**
- Create: `app/painel/(app)/reservas/nova/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { prisma } from '@/lib/prisma';
import { ReservationForm } from '../ReservationForm';
import { createReservation } from '../actions';

export default async function NovaReservaPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24, marginBottom: 20 }}>
        Nova reserva
      </h1>
      <ReservationForm action={createReservation} packages={packages} />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/painel/(app)/reservas/nova"
git commit -m "feat: build manual reservation creation screen"
```

---

### Task 21: Reservas — editar reserva

**Files:**
- Create: `app/painel/(app)/reservas/[id]/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReservationForm } from '../ReservationForm';
import { updateReservation, deleteReservation } from '../actions';

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateTimeInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 16) : '';
}

export default async function EditarReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [reservation, packages] = await Promise.all([
    prisma.reservation.findUnique({ where: { id } }),
    prisma.package.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!reservation || reservation.deletedAt) notFound();

  const updateWithId = updateReservation.bind(null, id);
  const deleteWithId = deleteReservation.bind(null, id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24 }}>Editar reserva</h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            style={{ background: 'none', border: '1px solid #c0392b', color: '#c0392b', borderRadius: 999, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}
          >
            Excluir reserva
          </button>
        </form>
      </div>
      <ReservationForm
        action={updateWithId}
        packages={packages}
        initialValues={{
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail ?? undefined,
          guestPhone: reservation.guestPhone,
          checkIn: toDateInputValue(reservation.checkIn),
          checkOut: toDateInputValue(reservation.checkOut),
          packageId: reservation.packageId,
          pax: reservation.pax,
          totalValue: Number(reservation.totalValue),
          status: reservation.status,
          notes: reservation.notes ?? undefined,
          transferStatus: reservation.transferStatus,
          transferProvider: reservation.transferProvider ?? undefined,
          transferScheduledAt: toDateTimeInputValue(reservation.transferScheduledAt),
          transferNotes: reservation.transferNotes ?? undefined,
        }}
      />
    </div>
  );
}
```

Note: this delete button submits immediately on click with no confirmation dialog. That's an intentional scope decision for this prototype phase — YAGNI on a confirmation modal for an internal tool used by a handful of trusted staff. If that turns out to be too easy to trigger by accident, add a browser `confirm()` in a client wrapper component around the button in a follow-up.

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/painel/(app)/reservas/[id]"
git commit -m "feat: build reservation edit screen"
```

---

### Task 22: Financeiro — valores a receber

**Files:**
- Create: `app/painel/(app)/financeiro/page.tsx`
- Create: `app/painel/(app)/financeiro/financeiro.module.css`
- Create: `app/painel/(app)/financeiro/ProvisioningPanel.tsx`

- [ ] **Step 1: Create `app/painel/(app)/financeiro/financeiro.module.css`**

```css
.section {
  margin-bottom: 40px;
}

.sectionTitle {
  font-family: var(--font-petrona), serif;
  font-size: 20px;
  margin-bottom: 16px;
}

.total {
  font-family: var(--font-petrona), serif;
  font-size: 32px;
  margin-bottom: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--sand);
  font-size: 14px;
}

.periodControls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.periodControls select,
.periodControls input {
  padding: 8px 10px;
  border: 1px solid var(--sand);
  border-radius: 4px;
}

.breakdown {
  display: flex;
  gap: 24px;
  font-size: 14px;
}
```

- [ ] **Step 2: Create `app/painel/(app)/financeiro/ProvisioningPanel.tsx`**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { calculateProvisioning, type ReservationForFinance } from '@/lib/finance';
import styles from './financeiro.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProvisioningPanel({ reservations }: { reservations: ReservationForFinance[] }) {
  const [mode, setMode] = useState<'month' | 'day'>('month');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.toISOString().slice(0, 10));
  const [, startTransition] = useTransition();

  const summary = calculateProvisioning(
    reservations,
    mode === 'month' ? { type: 'month', year, month } : { type: 'day', date: day }
  );

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Provisionamento</h2>
      <div className={styles.periodControls}>
        <select value={mode} onChange={(e) => startTransition(() => setMode(e.target.value as 'month' | 'day'))}>
          <option value="month">Por mês</option>
          <option value="day">Por dia específico</option>
        </select>
        {mode === 'month' ? (
          <>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 80 }} />
          </>
        ) : (
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        )}
      </div>
      <div className={styles.total}>{formatBRL(summary.total)}</div>
      <div className={styles.breakdown}>
        <span>Pago: {formatBRL(summary.byStatus.pago)}</span>
        <span>Aguardando sinal: {formatBRL(summary.byStatus.aguardando_sinal)}</span>
        <span>Aguardando pagamento: {formatBRL(summary.byStatus.aguardando_pagamento)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/painel/(app)/financeiro/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma';
import { calculateReceivables } from '@/lib/finance';
import { ProvisioningPanel } from './ProvisioningPanel';
import styles from './financeiro.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export default async function FinanceiroPage() {
  const reservations = await prisma.reservation.findMany({
    where: { deletedAt: null },
    select: { id: true, checkIn: true, totalValue: true, status: true, guestName: true },
    orderBy: { checkIn: 'asc' },
  });

  const forFinance = reservations.map((r) => ({
    id: r.id,
    checkIn: r.checkIn.toISOString().slice(0, 10),
    totalValue: Number(r.totalValue),
    status: r.status,
  }));

  const receivables = calculateReceivables(forFinance);
  const receivableById = new Map(reservations.map((r) => [r.id, r]));

  return (
    <div>
      <div className={styles.section}>
        <h1 className={styles.sectionTitle}>Valores a receber</h1>
        <div className={styles.total}>{formatBRL(receivables.total)}</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hóspede</th>
              <th>Check-in</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {receivables.items.map((item) => {
              const r = receivableById.get(item.id)!;
              return (
                <tr key={item.id}>
                  <td>{r.guestName}</td>
                  <td>{formatDate(r.checkIn)}</td>
                  <td>{formatBRL(item.totalValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProvisioningPanel reservations={forFinance} />
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/painel/(app)/financeiro"
git commit -m "feat: build financeiro screen (valores a receber + provisionamento)"
```

---

### Task 23: Tarifário editor

**Files:**
- Create: `app/painel/(app)/tarifario/page.tsx`
- Create: `app/painel/(app)/tarifario/PackageRow.tsx`
- Create: `app/painel/(app)/tarifario/actions.ts`
- Create: `app/painel/(app)/tarifario/tarifario.module.css`

- [ ] **Step 1: Create `app/painel/(app)/tarifario/tarifario.module.css`**

```css
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}

.card {
  border: 1px solid var(--sand);
  border-radius: var(--radius);
  padding: 20px;
  background: #fff;
}

.row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 11px;
  color: var(--text-secondary);
}

.field input,
.field textarea {
  padding: 8px 10px;
  border: 1px solid var(--sand);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.save {
  padding: 8px 20px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--ink);
  color: var(--bg-primary);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
```

- [ ] **Step 2: Create `app/painel/(app)/tarifario/actions.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updatePackage(id: string, formData: FormData) {
  await prisma.package.update({
    where: { id },
    data: {
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      priceLow: Number(formData.get('priceLow') ?? 0),
      priceHigh: Number(formData.get('priceHigh') ?? 0),
      priceSpecial: formData.get('priceSpecial') ? Number(formData.get('priceSpecial')) : null,
      active: formData.get('active') === 'on',
    },
  });

  revalidatePath('/painel/tarifario');
}
```

- [ ] **Step 3: Create `app/painel/(app)/tarifario/PackageRow.tsx`**

```tsx
import { updatePackage } from './actions';
import styles from './tarifario.module.css';

export interface PackageRowData {
  id: string;
  name: string;
  description: string;
  priceLow: number;
  priceHigh: number;
  priceSpecial: number | null;
  active: boolean;
}

export function PackageRow({ pkg }: { pkg: PackageRowData }) {
  const updateWithId = updatePackage.bind(null, pkg.id);

  return (
    <form action={updateWithId} className={styles.card}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`name-${pkg.id}`}>Nome</label>
          <input id={`name-${pkg.id}`} name="name" defaultValue={pkg.name} required />
        </div>
        <div className={styles.field}>
          <label>
            <input type="checkbox" name="active" defaultChecked={pkg.active} /> Ativo
          </label>
        </div>
      </div>
      <div className={styles.field} style={{ marginBottom: 12 }}>
        <label htmlFor={`description-${pkg.id}`}>Descrição</label>
        <textarea id={`description-${pkg.id}`} name="description" rows={2} defaultValue={pkg.description} />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`priceLow-${pkg.id}`}>Baixa temporada (R$)</label>
          <input id={`priceLow-${pkg.id}`} name="priceLow" type="number" step="0.01" defaultValue={pkg.priceLow} required />
        </div>
        <div className={styles.field}>
          <label htmlFor={`priceHigh-${pkg.id}`}>Alta temporada (R$)</label>
          <input id={`priceHigh-${pkg.id}`} name="priceHigh" type="number" step="0.01" defaultValue={pkg.priceHigh} required />
        </div>
        <div className={styles.field}>
          <label htmlFor={`priceSpecial-${pkg.id}`}>Especial (R$, opcional)</label>
          <input id={`priceSpecial-${pkg.id}`} name="priceSpecial" type="number" step="0.01" defaultValue={pkg.priceSpecial ?? ''} />
        </div>
      </div>
      <button type="submit" className={styles.save}>
        Salvar
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create `app/painel/(app)/tarifario/page.tsx`**

```tsx
import { prisma } from '@/lib/prisma';
import { PackageRow } from './PackageRow';
import styles from './tarifario.module.css';

export default async function TarifarioPage() {
  const packages = await prisma.package.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24, marginBottom: 20 }}>
        Tarifário
      </h1>
      <div className={styles.list}>
        {packages.map((pkg) => (
          <PackageRow
            key={pkg.id}
            pkg={{
              id: pkg.id,
              name: pkg.name,
              description: pkg.description,
              priceLow: Number(pkg.priceLow),
              priceHigh: Number(pkg.priceHigh),
              priceSpecial: pkg.priceSpecial ? Number(pkg.priceSpecial) : null,
              active: pkg.active,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "app/painel/(app)/tarifario"
git commit -m "feat: build tarifário editor screen"
```

---

## Phase 4 — Seed data and verification

### Task 24: Seed script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add `prisma.seed` config)

- [ ] **Step 1: Add the seed config to `package.json`**

In `package.json`, add a top-level `"prisma"` key (sibling to `"scripts"`):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Install tsx (to run the TypeScript seed script) and dotenv**

```bash
npm install -D tsx
```

- [ ] **Step 3: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

const PACKAGES = [
  {
    slug: 'rio-negro',
    name: 'Rio Negro',
    description: 'Três noites com as atividades da propriedade e as duas saídas de lancha mais marcantes da região.',
    nights: 3,
    priceLow: 21400,
    priceHigh: 24900,
    priceSpecial: null,
  },
  {
    slug: 'macucus',
    name: 'Macucus',
    description: 'Quatro noites, acrescentando a imersão cultural em Novo Airão.',
    nights: 4,
    priceLow: 29000,
    priceHigh: 33800,
    priceSpecial: 39000,
  },
  {
    slug: 'ajuricaba',
    name: 'Ajuricaba',
    description: 'Cinco noites, nossa sugestão — inclui o passeio mais longo do roteiro: as Grutas do Madadá.',
    nights: 5,
    priceLow: 37500,
    priceHigh: 43400,
    priceSpecial: 49900,
  },
  {
    slug: 'pouso',
    name: 'Pouso',
    description: 'O lugar perfeito para quem já conhece a Amazônia. Usufrua das atividades de mata e rio da propriedade.',
    nights: null,
    priceLow: 6000,
    priceHigh: 7400,
    priceSpecial: 8500,
  },
];

const GUEST_NAMES = [
  'Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Alves', 'Elisa Ferreira',
  'Felipe Rocha', 'Gabriela Nunes', 'Henrique Dias', 'Isabela Castro', 'João Pedro Martins',
  'Larissa Ramos', 'Marcelo Teixeira', 'Nathalia Pires', 'Otávio Barros', 'Patrícia Gomes',
];

function isoDate(daysFromToday: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d;
}

async function main() {
  console.log('Seeding packages...');
  const createdPackages = [];
  for (const pkg of PACKAGES) {
    const created = await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
    createdPackages.push(created);
  }

  console.log('Seeding staff user...');
  const seedPassword = process.env.SEED_STAFF_PASSWORD;
  if (!seedPassword) {
    throw new Error('Set SEED_STAFF_PASSWORD before running the seed, e.g. SEED_STAFF_PASSWORD=... npm run db:seed');
  }
  await prisma.staffUser.upsert({
    where: { email: 'equipe@pousodascastanheiras.com.br' },
    update: {},
    create: {
      email: 'equipe@pousodascastanheiras.com.br',
      passwordHash: await hashPassword(seedPassword),
    },
  });

  console.log('Seeding reservations...');
  await prisma.reservation.deleteMany({});

  const statuses = ['pago', 'aguardando_pagamento', 'aguardando_sinal'] as const;
  const transferStatuses = ['organizado', 'pendente'] as const;

  for (let i = 0; i < 18; i++) {
    const checkIn = isoDate(-30 + i * 6);
    const nights = 3 + (i % 3);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    const pkg = createdPackages[i % createdPackages.length];
    const status = statuses[i % statuses.length];
    const transferStatus = transferStatuses[i % transferStatuses.length];

    await prisma.reservation.create({
      data: {
        source: i % 4 === 0 ? 'manual' : 'site',
        status,
        checkIn,
        checkOut,
        guestName: GUEST_NAMES[i % GUEST_NAMES.length],
        guestEmail: `hospede${i}@example.com`,
        guestPhone: `1199${String(9000000 + i).padStart(7, '0')}`,
        packageId: pkg.id,
        pax: 2 + (i % 5),
        totalValue: Number(pkg.priceLow) + i * 100,
        transferStatus,
        transferProvider: transferStatus === 'organizado' ? 'Táxi da cooperativa' : null,
        transferScheduledAt: transferStatus === 'organizado' ? checkIn : null,
        transferNotes: transferStatus === 'pendente' ? 'Aguardando confirmação do hóspede sobre o horário do voo.' : null,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Run the seed**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
SEED_STAFF_PASSWORD="TrocarDepois123!" npx prisma db seed
```

Expected: prints `Seeding packages...`, `Seeding staff user...`, `Seeding reservations...`, `Seed complete.` with no errors.

- [ ] **Step 5: Verify the data landed**

```bash
npx prisma studio
```

Opens a browser at `http://localhost:5555` — confirm `Package` has 4 rows, `Reservation` has 18 rows, `StaffUser` has 1 row. Close it (Ctrl+C) when done.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "feat: add seed script (packages, sample reservations, staff user)"
```

---

### Task 25: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated test suite**

```bash
npm run test
npx tsc --noEmit
npm run lint
```

Expected: all green — this now includes every `lib/*.test.ts` from this plan (password, encryption, totp, rateLimit, finance, panelCalendar) alongside the site's existing tests.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: builds successfully, no route errors. Confirm `/painel/*` routes appear in the route list alongside the existing `/[locale]/*` ones.

- [ ] **Step 3: Manual end-to-end walkthrough**

```bash
npm run dev
```

In the browser:
1. Go to `http://localhost:3000/painel` — confirm it redirects to `/painel/login`.
2. Log in with `equipe@pousodascastanheiras.com.br` and the password you used for `SEED_STAFF_PASSWORD`.
3. Confirm it forces the TOTP setup screen — scan the QR code with an authenticator app (Google Authenticator, Authy, or similar), type the 6-digit code, confirm it lands on `/painel`.
4. Log out, log back in — confirm it now asks for e-mail + senha, then the TOTP code, and lands on the dashboard.
5. On the dashboard, confirm the "Pagamentos pendentes" list shows the seeded reservations with `aguardando_sinal`/`aguardando_pagamento`, and the count matches the badge next to "Reservas" in the sidebar.
6. Go to Calendário — confirm days are colored per the legend and match the seeded reservations' date ranges.
7. Go to Reservas — search by a seeded guest's first name, confirm the table filters. Click into one, edit its payment status, save, confirm the change reflects on the dashboard and calendar.
8. Click "Nova reserva", fill the form (including the traslado block), save, confirm it appears in the list with `source: manual`.
9. Go to Financeiro — confirm "Valores a receber" total matches the sum of non-`pago` reservations; switch the provisionamento period between a month with seeded reservations and one without, confirm the total changes correctly; try the "por dia específico" mode.
10. Go to Tarifário, edit a package's price, save, reload the page, confirm the new value persisted.
11. Try 5 wrong-password login attempts in a row — confirm the 6th attempt is blocked with the rate-limit message.
12. Open a reservation you don't need, click "Excluir reserva", confirm it disappears from the Reservas list, the Calendário, and the dashboard's pending-payments list (soft-deleted, not gone from the database — check with `npx prisma studio` that its `deletedAt` is set rather than the row being gone).

- [ ] **Step 4: Fix anything found, committing each fix separately.**

---

## What's deliberately not in this plan

- No real Google Calendar sync, no site-facing `/tarifas` reading from `Package` — both are the "Integração" sub-project, planned after the client reviews this prototype.
- No role-based permissions — every `StaffUser` has identical access, per the approved spec.
- No CMS for experience pages — explicitly deferred by the client.
- No payment processing — all payment status changes are manual, per the approved spec.
