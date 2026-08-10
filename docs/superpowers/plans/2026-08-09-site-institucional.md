# Site Institucional Pouso das Castanheiras — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the Pouso das Castanheiras design prototype as a real Next.js site (all 7 pages, pt/en, pixel-faithful to the design tokens) with a working reservation form that composes and opens the same `wa.me` WhatsApp message the prototype does today — with **no backend yet** (no database, no Google Calendar, no email/WhatsApp notifications to the pousada; that is a separate follow-up plan).

**Architecture:** Next.js 14+ App Router + TypeScript, hosted on Vercel. All business logic that has no UI dependency (season/price calculation, WhatsApp message composition, the reservation calendar's date-range algorithm, the header's scroll-driven color swap) is extracted into small, pure, unit-tested functions under `lib/`. Static content (activities, packages, prices, itineraries, transfer labels, press quotes) lives in typed modules under `content/`, ported verbatim from the prototype's embedded constants. Pages are composed from per-section components under `components/`, each mapped to an exact section of the prototype referenced by file and line range. Internationalization uses `next-intl`.

**Tech Stack:** Next.js 14 (App Router, TypeScript), `next-intl`, `next/font/google` (Petrona, Jost), `next/image`, Vitest for unit tests, Leaflet/OpenStreetMap (ported as-is via `route-map.html`), deployed on Vercel.

**Source of truth for content and behavior:** `/Users/sciensa/Desktop/design_handoff_pouso_castanheiras/design-source/Pouso das Castanheiras.dc.html` (referred to below as `dc.html`), `design-source/support.js`, `design-source/route-map.html`, and the design tokens documented in `design_handoff_pouso_castanheiras/README.md`. The standalone file `pouso-das-castanheiras-standalone.html` is useful to open side-by-side in a browser for visual comparison (it's the same design, self-contained with embedded assets).

**Project directory:** `/Users/sciensa/Desktop/pouso-castanheiras` (git already initialized, `origin` set to `https://github.com/brunomizrahi/pouso-castanheiras.git`, nothing pushed yet).

---

## How to verify page-assembly tasks

Tasks that port markup/CSS (Phase 6) don't have meaningful unit tests — fidelity is visual. For each one:
1. Run `npm run dev` and open `http://localhost:3000/<route>`.
2. Open `design_handoff_pouso_castanheiras/pouso-das-castanheiras-standalone.html` in a second browser tab/window, navigate it to the same page (the prototype is a single-page app; use its own nav).
3. Compare side-by-side at desktop width, then at ≤900px and ≤560px (resize the browser or use dev tools device toolbar) — the three breakpoints documented in the README.
4. Check computed styles against the design tokens (colors, type scale, spacing) listed in `design_handoff_pouso_castanheiras/README.md` when anything looks off.

---

## Phase 0 — Project scaffold

### Task 1: Scaffold the Next.js project

**Files:**
- Create: entire Next.js project tree at `/Users/sciensa/Desktop/pouso-castanheiras`

- [ ] **Step 1: Scaffold into a temp folder (the project root already has `docs/` and `.git`, which `create-next-app` may refuse to run against directly)**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
npx create-next-app@latest tmp-app --typescript --eslint --app --no-tailwind --no-src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Move the generated project up to the repo root**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
rm -rf tmp-app/.git   # create-next-app skips git-init when nested in an existing repo, but remove defensively if present
shopt -s dotglob
mv tmp-app/* .
shopt -u dotglob
rmdir tmp-app
```

- [ ] **Step 3: Install dependencies and smoke-test the dev server**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
npm install
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
kill %1
```

Expected: `200`.

- [ ] **Step 4: Commit**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Configure Vitest for unit tests

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Install Vitest**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
npm install -D vitest
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `"scripts"` object, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify it runs with zero tests found (no test files exist yet)**

```bash
npm run test
```

Expected: exits 0, reports "No test files found" (or similar) — that's fine, confirms the runner is wired up.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: configure Vitest"
```

---

### Task 3: Copy design assets into `public/`

**Files:**
- Create: `public/img/*` (38 JPEGs + `mark.png` + `logo-full-light.png`)
- Create: `public/video/hidroaviao.mp4`
- Create: `public/route-map.html`

- [ ] **Step 1: Copy images, video and the map iframe source**

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
mkdir -p public/img public/video
cp "/Users/sciensa/Desktop/design_handoff_pouso_castanheiras/design-source/img/"* public/img/
cp "/Users/sciensa/Desktop/design_handoff_pouso_castanheiras/design-source/video/hidroaviao.mp4" public/video/
cp "/Users/sciensa/Desktop/design_handoff_pouso_castanheiras/design-source/route-map.html" public/route-map.html
```

- [ ] **Step 2: Verify asset count matches the source**

```bash
ls public/img | wc -l   # expected: 40 (38 photos + mark.png + logo-full-light.png)
ls public/video          # expected: hidroaviao.mp4
```

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "chore: import design assets (images, video, route map)"
```

---

## Phase 1 — Design tokens and fonts

### Task 4: Design tokens as CSS custom properties

**Files:**
- Modify: `app/globals.css` (replace the `create-next-app` boilerplate content entirely)

- [ ] **Step 1: Replace `app/globals.css` with the token set from the design handoff README**

```css
:root {
  /* Colors — design_handoff_pouso_castanheiras/README.md, "Cores" table */
  --bg-primary: #FBF9F5;
  --bg-alt: #FAF8F3;
  --bg-neutral: #F4F1EB;
  --ink: #2A1C12;
  --olive: #5F6245;
  --sand: #E3DFD6;
  --sand-dark: #E9E5DC;
  --text-secondary: #6B5A4C;
  --text-on-olive: #4A3B30;
  --text-tertiary: #9A8F80;
  --text-disabled: #A79E8E;
  --number-decorative: #C9C2B4;
  --hero-bg: #1a1a17;

  /* Text on dark backgrounds — opacities over --bg-primary */
  --on-dark-86: rgba(251, 249, 245, .86);
  --on-dark-82: rgba(251, 249, 245, .82);
  --on-dark-72: rgba(251, 249, 245, .72);
  --on-dark-60: rgba(251, 249, 245, .6);
  --on-dark-55: rgba(251, 249, 245, .55);
  --on-dark-42: rgba(251, 249, 245, .42);
  --border-on-dark: rgba(251, 249, 245, .14);
  --border-on-dark-strong: rgba(251, 249, 245, .5);
  --border-on-light: rgba(42, 28, 18, .28);

  /* Layout */
  --max-width: 1420px;
  --section-padding-x: clamp(20px, 4vw, 56px);
  --section-padding-y: clamp(72px, 11vh, 130px);
  --section-padding-y-lg: clamp(88px, 13vh, 160px);
  --grid-gap: clamp(10px, 1vw, 16px);
  --content-gap: clamp(24px, 3vw, 48px);
  --radius: 4px;
  --radius-pill: 999px;
  --header-height: 78px;

  /* Motion */
  --ease-standard: cubic-bezier(.2, .8, .2, 1);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  color: var(--ink);
}

body {
  font-family: var(--font-jost), sans-serif;
  font-weight: 300;
  font-size: clamp(15.5px, 1.25vw, 18px);
  line-height: 1.78;
}

h1, h2, .font-serif {
  font-family: var(--font-petrona), serif;
  font-weight: 300;
}

h1, h2 {
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}

.label {
  font-family: var(--font-jost), sans-serif;
  font-weight: 400;
  font-size: 10.5px;
  letter-spacing: .3em;
  text-transform: uppercase;
  color: var(--olive);
}

@keyframes kb {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes menuIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Note for the engineer: this file intentionally does not yet include every component-level style — those live in each component's CSS module (Phase 5/6). This file only holds the tokens and the handful of keyframes shared across components.

- [ ] **Step 2: Remove any leftover boilerplate rules `create-next-app` generated below what you just wrote (check the file for a stray `@media (prefers-color-scheme: dark)` block or default button/link styling) and delete them** — the prototype has no dark-mode toggle and no default browser styling; this project defines its own tokens exclusively.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add design tokens (colors, layout, motion) to globals.css"
```

---

### Task 5: Configure Petrona and Jost fonts

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the default font imports in `app/layout.tsx` with Petrona and Jost**

```tsx
import type { Metadata } from 'next';
import { Petrona, Jost } from 'next/font/google';
import './globals.css';

const petrona = Petrona({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-petrona',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  title: 'Pouso das Castanheiras',
  description:
    'Pousada de uso exclusivo em 26 hectares de floresta às margens do Rio Negro, em Novo Airão (AM).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${petrona.variable} ${jost.variable}`}>{children}</body>
    </html>
  );
}
```

This root layout gets replaced by the locale-aware layout in Task 19 (Phase 2) — this task only proves the fonts load correctly.

- [ ] **Step 2: Verify fonts load**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -o "font-petrona\|font-jost" | sort -u
kill %1
```

Expected: both `font-petrona` and `font-jost` printed.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: configure Petrona and Jost fonts"
```

---

## Phase 2 — Pure logic (TDD)

This phase ports every piece of prototype behavior that has no rendering concerns, straight from `dc.html`'s `<script data-dc-script>` block (lines 1782–1927). It's the highest-risk logic in the project (money and dates), so it's fully unit tested before any UI touches it.

### Task 6: Shared `Locale` type

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create the type**

```ts
export type Locale = 'pt' | 'en';
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "chore: add shared Locale type"
```

---

### Task 7: Date/currency formatting helpers

**Files:**
- Create: `lib/format.ts`
- Test: `lib/format.test.ts`

Ported verbatim from `dc.html` lines 1790–1793 (`brl`, `iso`, `fromIso`, `fmtBr`).

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { brl, iso, fromIso, fmtBr } from './format';

describe('brl', () => {
  it('formats an integer as Brazilian currency with a thousands separator and no decimals', () => {
    expect(brl(37500)).toBe('R$ 37.500');
  });

  it('formats small numbers without a thousands separator', () => {
    expect(brl(500)).toBe('R$ 500');
  });
});

describe('iso', () => {
  it('formats a Date as YYYY-MM-DD, zero-padded', () => {
    expect(iso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('fromIso', () => {
  it('parses an ISO date string into a local Date at midnight', () => {
    const d = fromIso('2026-01-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });
});

describe('fmtBr', () => {
  it('formats an ISO date string as DD/MM/YYYY', () => {
    expect(fmtBr('2026-01-05')).toBe('05/01/2026');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/format.test.ts
```

Expected: FAIL — `Cannot find module './format'` (the module doesn't exist yet).

- [ ] **Step 3: Implement `lib/format.ts`**

```ts
export function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

export function iso(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function fromIso(s: string): Date {
  const p = s.split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

export function fmtBr(s: string): string {
  const d = fromIso(s);
  return (
    String(d.getDate()).padStart(2, '0') +
    '/' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '/' +
    d.getFullYear()
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/format.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/format.test.ts
git commit -m "feat: port date/currency formatting helpers"
```

---

### Task 8: Season calculation

**Files:**
- Create: `lib/season.ts`
- Test: `lib/season.test.ts`

Ported verbatim from `dc.html` lines 1795–1803 (`season`, `SEASON_LABEL`).

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { season } from './season';

describe('season', () => {
  it('returns "low" for a plain date outside any special window', () => {
    expect(season('2026-04-15')).toBe('low');
  });

  it('returns "low" for early/mid December, before the Réveillon window opens', () => {
    expect(season('2026-12-26')).toBe('low');
  });

  it('returns "special" for Réveillon, Dec 27 onward', () => {
    expect(season('2025-12-27')).toBe('special');
    expect(season('2025-12-31')).toBe('special');
  });

  it('returns "special" for Réveillon, up to Jan 5', () => {
    expect(season('2026-01-01')).toBe('special');
    expect(season('2026-01-05')).toBe('special');
  });

  it('returns "high" for January outside the Réveillon window', () => {
    expect(season('2026-01-10')).toBe('high');
  });

  it('returns "low" for early February, before Carnaval opens', () => {
    expect(season('2026-02-12')).toBe('low');
  });

  it('returns "special" for Carnaval, Feb 13 onward', () => {
    expect(season('2026-02-13')).toBe('special');
  });

  it('returns "special" through March 18', () => {
    expect(season('2026-03-18')).toBe('special');
  });

  it('returns "low" from March 19 onward', () => {
    expect(season('2026-03-19')).toBe('low');
  });

  it('returns "high" for July', () => {
    expect(season('2026-07-15')).toBe('high');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/season.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/season.ts`**

```ts
import { fromIso } from './format';
import type { Locale } from './types';

export type Season = 'low' | 'high' | 'special';

export function season(isoStr: string): Season {
  const d = fromIso(isoStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 12 && day >= 27) || (m === 1 && day <= 5)) return 'special';
  if (m === 2 && day >= 13) return 'special';
  if (m === 3 && day <= 18) return 'special';
  if (m === 1 || m === 7) return 'high';
  return 'low';
}

export const SEASON_LABEL: Record<Season, Record<Locale, string>> = {
  low: { pt: 'Baixa temporada', en: 'Low season' },
  high: { pt: 'Alta temporada', en: 'High season' },
  special: { pt: 'Temporada especial', en: 'Special season' },
};
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/season.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/season.ts lib/season.test.ts
git commit -m "feat: port season calculation"
```

---

### Task 9: `content/transfers.ts`

**Files:**
- Create: `content/transfers.ts`

Ported verbatim from `dc.html` lines 1826–1831 (`TR_LABEL`). Pure data, no test needed (nothing to compute).

- [ ] **Step 1: Create the file**

```ts
import type { Locale } from '@/lib/types';

export type TransferKey = 'taxi' | 'van' | 'hidro' | 'depois';

export const TRANSFER_LABELS: Record<TransferKey, Record<Locale, string>> = {
  taxi: {
    pt: 'Táxi da cooperativa (R$ 1.100 ida e volta)',
    en: 'Cooperative taxi (R$ 1,100 round trip)',
  },
  van: {
    pt: 'Van executiva (R$ 1.300 cada trecho)',
    en: 'Executive van (R$ 1,300 each way)',
  },
  hidro: {
    pt: 'Hidroavião (R$ 11.000 cada trecho)',
    en: 'Seaplane (R$ 11,000 each way)',
  },
  depois: {
    pt: 'A definir com o Pouso',
    en: 'To be arranged with the Pouso',
  },
};

export const TRANSFER_ORDER: TransferKey[] = ['taxi', 'van', 'hidro', 'depois'];
```

- [ ] **Step 2: Commit**

```bash
git add content/transfers.ts
git commit -m "feat: port transfer labels content"
```

---

### Task 10: `content/packages.ts`

**Files:**
- Create: `content/packages.ts`

Ported verbatim from `dc.html`: `PRICES` (lines 1784–1789), `PKGS` PT fields (lines 1743–1756), `PKGS[i].en` overrides (lines 1814–1817, only `name`/`meta`/`body` are translated — `acts`, `img` and the numeric prices are not).

- [ ] **Step 1: Create the file**

```ts
import type { Locale } from '@/lib/types';

export interface PackageContent {
  name: Record<Locale, string>;
  meta: Record<Locale, string>;
  img: string;
  body: Record<Locale, string>;
  /** Indices into content/activities.ts ACTIVITIES, in itinerary order */
  acts: number[];
}

export interface PackagePrice {
  low: number;
  high: number;
  special: number | null;
}

// Order: Rio Negro, Macucus, Ajuricaba, Pouso — matches dc.html PKGS/PRICES index order.
export const PRICES: PackagePrice[] = [
  { low: 21400, high: 24900, special: null },
  { low: 29000, high: 33800, special: 39000 },
  { low: 37500, high: 43400, special: 49900 },
  { low: 6000, high: 7400, special: 8500 },
];

export const PACKAGES: PackageContent[] = [
  {
    name: { pt: 'Rio Negro', en: 'Rio Negro' },
    meta: { pt: 'Pacote · 3 noites', en: 'Package · 3 nights' },
    img: 'img/a02-1.jpg',
    body: {
      pt: 'Três noites com as atividades da propriedade e as duas saídas de lancha mais marcantes da região: o pôr do sol entre as ilhas de Anavilhanas, com focagem noturna, e a visita ao arquipélago com uma comunidade ribeirinha.',
      en: "Three nights with the property's own activities plus the two most memorable boat trips in the region: the sunset among the Anavilhanas islands with night spotting, and the visit to the archipelago with a riverside community.",
    },
    acts: [0, 3, 1, 2, 4],
  },
  {
    name: { pt: 'Macucus', en: 'Macucus' },
    meta: { pt: 'Pacote · 4 noites', en: 'Package · 4 nights' },
    img: 'img/trilha-castanheira.jpg',
    body: {
      pt: 'Quatro noites, acrescentando a imersão cultural em Novo Airão, com marchetaria, artesanato de fibras naturais e o Flutuante dos Botos, e uma tarde de pescaria recreativa ou o roteiro pelo Igarapé do Arraia e Casa de Farinha.',
      en: 'Four nights, adding the cultural immersion in Novo Airão, with marquetry, natural-fibre crafts and the Floating Dolphin platform, and an afternoon of recreational fishing or the route along the Arraia creek and the flour house.',
    },
    acts: [0, 3, 1, 2, 4, 5, 6, 7],
  },
  {
    name: { pt: 'Ajuricaba', en: 'Ajuricaba' },
    meta: { pt: 'Pacote · 5 noites · sugerido', en: 'Package · 5 nights · suggested' },
    img: 'img/grutas-madada.jpg',
    body: {
      pt: 'Cinco noites, nossa sugestão. Tempo para desconectar dos centros urbanos, relaxar de forma imersiva na natureza e incluir o passeio mais longo do roteiro: as Grutas do Madadá, com a Pedra Sanduíche e os petroglifos.',
      en: 'Five nights, our suggestion. Time to disconnect from the cities, relax fully into nature and include the longest excursion of the itinerary: the Madadá caves, with the Sandwich Rock and the petroglyphs.',
    },
    acts: [0, 3, 1, 2, 4, 5, 6, 7, 8],
  },
  {
    name: { pt: 'Pouso', en: 'Pouso' },
    meta: { pt: 'Por diária · mínimo 2 noites', en: 'Per night · minimum 2 nights' },
    img: 'img/a12-1.jpg',
    body: {
      pt: 'O lugar perfeito para quem já conhece a Amazônia, ou especificamente a região de Anavilhanas e Rio Negro, mas gostaria de se hospedar sem necessariamente repetir passeios já realizados. Usufrua apenas das atividades de mata e rio contempladas na própria propriedade, além dos serviços de pensão completa e camareira.',
      en: 'The perfect choice for those who already know the Amazon, or specifically the Anavilhanas and Rio Negro region, but would like to stay without necessarily repeating excursions. Enjoy only the forest and river activities on the property itself, plus full board and housekeeping.',
    },
    acts: [0, 1, 2],
  },
];
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/packages.ts
git commit -m "feat: port package content and pricing"
```

---

### Task 11: `content/press.ts`

**Files:**
- Create: `content/press.ts`

Ported verbatim from `dc.html`: `PRESS` (PT quotes + source names, lines 1703–1709) and `PRESS_EN` (English quotes, index-matched, lines 1819–1825 — source names are never translated).

- [ ] **Step 1: Create the file**

```ts
import type { Locale } from '@/lib/types';

export interface PressQuote {
  quote: Record<Locale, string>;
  source: string;
}

export const PRESS_QUOTES: PressQuote[] = [
  {
    quote: {
      pt: '“É viver a maior floresta tropical do mundo fora da comodidade de um quarto de hotel.”',
      en: '“It is living the largest tropical forest in the world, outside the comfort of a hotel room.”',
    },
    source: 'Now Boarding',
  },
  {
    quote: {
      pt: '“Uma verdadeira viagem sensorial através de sua gastronomia.”',
      en: '“A truly sensory journey through its cooking.”',
    },
    source: 'Revista Hotéis',
  },
  {
    quote: {
      pt: '“Tudo isso com muito conforto, segurança e completa imersão na floresta e na cultura local.”',
      en: '“All of it with great comfort, safety and full immersion in the forest and the local culture.”',
    },
    source: 'PANROTAS · Hotel Inspectors',
  },
  {
    quote: {
      pt: '“Hospedagem embrenhada no meio da mata com proposta de imersão na Amazônia.”',
      en: '“A stay tucked deep in the forest, built around immersion in the Amazon.”',
    },
    source: 'CNN Brasil',
  },
  {
    quote: {
      pt: '“A porta de entrada para uma imersão autêntica na Amazônia.”',
      en: '“The gateway to an authentic immersion in the Amazon.”',
    },
    source: 'Paes pelo Mundo',
  },
];
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/press.ts
git commit -m "feat: port press quotes content"
```

---

### Task 12: `content/activities.ts`

**Files:**
- Create: `content/activities.ts`

Ported verbatim from `dc.html`: `ACTS` PT fields (lines 1711–1739, 9 entries) and `ACTS[i].en` overrides (lines 1805–1813). `by` has no English override in the source — the prototype shows the same PT attribution regardless of language, so it's a plain string here, not a `Record<Locale, string>`.

- [ ] **Step 1: Create the file**

```ts
import type { Locale } from '@/lib/types';

export interface Activity {
  /** Two-digit display number, e.g. "01" */
  n: string;
  t: Record<Locale, string>;
  dur: Record<Locale, string>;
  season: Record<Locale, string>;
  packs: Record<Locale, string>;
  img: string;
  img2: string;
  body: Record<Locale, string>;
  quote: Record<Locale, string>;
  by: string;
}

export const ACTIVITIES: Activity[] = [
  {
    n: '01',
    t: { pt: 'Trilha na mata e Agrofloresta', en: 'Forest trail and agroforestry' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/trilha-castanheira.jpg',
    img2: 'img/a15-1.jpg',
    body: {
      pt: 'Descubra árvores centenárias como Castanheiras e Macucus, e desfrute da biodiversidade amazônica em nossas trilhas contemplativas, de fácil acesso, na mata primária do Pouso. Vivencie o nascer de novas florestas comestíveis, plantadas com as técnicas agroflorestais, em companhia das pessoas que cuidam dos plantios.',
      en: "Discover centuries-old trees such as Brazil nut and Macucu, and enjoy Amazonian biodiversity on our contemplative, easy-access trails through the Pouso's primary forest. Watch new edible forests take root, planted with agroforestry techniques, alongside the people who tend them.",
    },
    quote: {
      pt: '“Uma verdadeira experiência de imersão na Amazônia.”',
      en: '“A true experience of immersion in the Amazon.”',
    },
    by: 'Tom Rera e família',
  },
  {
    n: '02',
    t: { pt: 'Praia ou Floresta Alagada, Canoas e Mergulho no Rio', en: 'Beach or flooded forest, canoes and river swimming' },
    dur: { pt: 'Livre', en: 'Open' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/praia-lounge.jpg',
    img2: 'img/canoa-igapo.jpg',
    body: {
      pt: 'Na época de seca (set–jan), desfrute da linda praia particular que dispomos no Pouso. Na época de cheia (fev–ago), explore os igapós e florestas alagadas que circundam a propriedade. Em ambas as estações, pratique canoagem, stand-up paddle e um revigorante mergulho no rio.',
      en: 'In the dry season (Sep–Jan), enjoy the beautiful private beach at the Pouso. In the flood season (Feb–Aug), explore the igapós and flooded forests surrounding the property. In both seasons, try canoeing, stand-up paddle and a refreshing swim in the river.',
    },
    quote: {
      pt: '“Remar de canoa cabocla é a melhor maneira de explorar o rio em sua plenitude.”',
      en: '“Paddling a traditional canoe is the best way to explore the river in full.”',
    },
    by: 'Equipe do Pouso',
  },
  {
    n: '03',
    t: { pt: 'Piracaia na praia', en: 'Piracaia on the beach' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Seca (set–jan)', en: 'Dry season (Sep–Jan)' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/piracaia-praia.jpg',
    img2: 'img/luau-praia.jpg',
    body: {
      pt: 'Na época de seca, a depender da condição meteorológica, servimos uma tradicional piracaia na praia particular do Pouso: um jantar de assado tradicional de peixe. Opcional: luau na praia com produção e ambientação especial, sujeito a consulta de disponibilidade e valores.',
      en: "In the dry season, weather permitting, we serve a traditional piracaia on the Pouso's private beach, a dinner of fish roasted in the traditional way. Optional: a luau on the beach with special staging and atmosphere, subject to availability and pricing.",
    },
    quote: {
      pt: '“A comida super gostosa, e a descoberta de alimentos típicos da região foram um sucesso total.”',
      en: '“The food was delicious, and discovering the region\'s typical ingredients was a complete success.”',
    },
    by: 'Bruna Constantino e família',
  },
  {
    n: '04',
    t: { pt: 'Pôr do Sol e Focagem Noturna', en: 'Sunset and night spotting' },
    dur: { pt: '3h', en: '3h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Rio Negro, Macucus, Ajuricaba', en: 'Rio Negro, Macucus, Ajuricaba' },
    img: 'img/focagem-noturna.jpg',
    img2: 'img/a16-1.jpg',
    body: {
      pt: 'Saída de lancha no final da tarde para o pôr do sol no meio das ilhas de Anavilhanas, seguida de focagem com possibilidade de avistamento de espécies de hábitos noturnos, como corujas, jacarés e preguiças. Esse é um dos passeios mais emocionantes e sensoriais oferecidos, pois permite sentir o rio e a floresta no silêncio da noite.',
      en: 'A late-afternoon boat trip for the sunset among the Anavilhanas islands, followed by night spotting with the chance to see nocturnal species such as owls, caimans and sloths. This is one of the most moving and sensory excursions we offer, letting you feel the river and the forest in the silence of the night.',
    },
    quote: {
      pt: '“À noite você pode desfrutar do show sonoro único da floresta.”',
      en: '“At night you can enjoy the forest\'s unique sound show.”',
    },
    by: 'Tom Rera e família',
  },
  {
    n: '05',
    t: { pt: 'Arquipélago de Anavilhanas e Comunidade Ribeirinha', en: 'Anavilhanas archipelago and riverside community' },
    dur: { pt: '3h a 4h', en: '3h to 4h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Rio Negro, Macucus, Ajuricaba', en: 'Rio Negro, Macucus, Ajuricaba' },
    img: 'img/a17-1.jpg',
    img2: 'img/comunidade-ribeirinha.jpg',
    body: {
      pt: 'Visite o Parque Nacional de Anavilhanas, 2º maior arquipélago fluvial do mundo, com as místicas florestas alagadas na época de cheia, ou incríveis praias de areia branca no leito do Rio Negro na época de seca. Conheça o modo de vida amazônico visitando uma comunidade tradicional ribeirinha, com opção de almoço no restaurante de base comunitária, colaborando para a geração de renda local.',
      en: 'Visit Anavilhanas National Park, the second largest river archipelago in the world, with its mystical flooded forests in the flood season, or incredible white sand beaches on the bed of the Rio Negro in the dry season. Get to know Amazonian life by visiting a traditional riverside community, with the option of lunch at the community-run restaurant, contributing to local income.',
    },
    quote: {
      pt: '“Se a Amazônia é o paraíso dos mistérios, o Pouso é o próprio portal.”',
      en: '“If the Amazon is the paradise of mysteries, the Pouso is the gateway itself.”',
    },
    by: 'Marcus Ozi',
  },
  {
    n: '06',
    t: { pt: 'Maravilhas culturais de Novo Airão', en: 'Cultural wonders of Novo Airão' },
    dur: { pt: '2h30', en: '2h30' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/artesas.jpg',
    img2: 'img/novo-airao.jpg',
    body: {
      pt: 'City tour em Novo Airão: visita à Fundação Almerinda Malaquias, instituto ligado ao trabalho de marchetaria com aproveitamento sustentável de madeiras típicas da região; à Associação das Artesãs de Novo Airão, cooperativa com produção à base de cipó-ambé, arumã e outras fibras naturais; à loja da etnia indígena Waimiri Atroari; e, por último, ao Flutuante dos Botos.',
      en: 'A city tour of Novo Airão: a visit to the Almerinda Malaquias Foundation, an institute devoted to marquetry using sustainably sourced regional woods; to the Novo Airão Artisans Association, a cooperative working with cipó-ambé, arumã and other natural fibres; to the Waimiri Atroari indigenous shop; and finally to the Floating Dolphin platform.',
    },
    quote: {
      pt: '“Muito amor por toda parte. O Pouso prometeu e entregou tudo.”',
      en: '“Love everywhere you look. The Pouso promised and delivered everything.”',
    },
    by: 'Ana Carolina Srougi e família Soares',
  },
  {
    n: '07',
    t: { pt: 'Pescaria recreativa', en: 'Recreational fishing' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/a16-1.jpg',
    img2: 'img/a17-1.jpg',
    body: {
      pt: 'Relaxe e contemple as paisagens enquanto tenta pescar um tucunaré ou uma piranha no final da tarde, no meio das ilhas de Anavilhanas. Alternativa ao passeio pelo Igarapé do Arraia quando o nível do rio não permite o acesso.',
      en: 'Relax and take in the landscape while trying to catch a peacock bass or a piranha in the late afternoon, among the Anavilhanas islands. An alternative to the Arraia creek trip when the river level does not allow access.',
    },
    quote: {
      pt: '“O rio no final da tarde é outro lugar. Tudo desacelera.”',
      en: '“The river in the late afternoon is another place entirely. Everything slows down.”',
    },
    by: 'Equipe do Pouso',
  },
  {
    n: '08',
    t: { pt: 'Igarapé do Arraia e Casa de Farinha', en: 'Arraia creek and the flour house' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Cheia (fev–ago)', en: 'Flood season (Feb–Aug)' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/comunidade-ribeirinha.jpg',
    img2: 'img/artesas.jpg',
    body: {
      pt: 'Na época de cheia, passeio pelo igarapé do Arraia e visita a sítios de moradores da comunidade, conhecendo a maneira como vivem e a arte tradicional de produzir farinha. É uma oportunidade para aprofundamento em relação à cultura ribeirinha, em roteiro pouco explorado na região. Se o nível do rio não permitir o acesso, optamos pela pescaria recreativa.',
      en: 'In the flood season, a trip along the Arraia creek and a visit to the smallholdings of community residents, learning how they live and the traditional art of making cassava flour. It is a chance to go deeper into riverside culture, on a route little explored in the region. If the river level does not allow access, we switch to recreational fishing.',
    },
    quote: {
      pt: '“Vivências de valor inestimável em comunidades ribeirinhas.”',
      en: '“Experiences of priceless value in riverside communities.”',
    },
    by: 'CNN Brasil',
  },
  {
    n: '09',
    t: { pt: 'Grutas do Madadá', en: 'Madadá caves' },
    dur: { pt: '5h · trilha 1h15', en: '5h · 1h15 trail' },
    season: { pt: 'Petroglifos só na seca', en: 'Petroglyphs in dry season only' },
    packs: { pt: 'Ajuricaba', en: 'Ajuricaba' },
    img: 'img/grutas-madada.jpg',
    img2: 'img/rio-negro-pedras.jpg',
    body: {
      pt: 'Suba o Rio Negro em busca da curiosa Pedra Sanduíche, das inscrições rupestres denominadas petroglifos (visíveis apenas na seca) e das famosas Grutas do Madadá, formações rochosas únicas encravadas no meio da floresta. Esse passeio é feito regularmente de lancha, acrescido de um piquenique na mata. Caso optem pelo aluguel de barco regional, com almoço servido a bordo, será cobrado um adicional no valor do pacote e o tempo de passeio aumenta para cerca de 6 a 7 horas.',
      en: 'Head up the Rio Negro in search of the curious Sandwich Rock, the rock inscriptions known as petroglyphs (visible only in the dry season) and the famous Madadá caves, unique rock formations set deep in the forest. This excursion is normally made by speedboat, with a picnic in the forest. If you opt to charter a regional boat with lunch served on board, a supplement is added to the package price and the trip extends to around 6 to 7 hours.',
    },
    quote: {
      pt: '“Formações rochosas únicas no coração da floresta.”',
      en: '“Unique rock formations in the heart of the forest.”',
    },
    by: 'Apresentação do Pouso',
  },
];
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/activities.ts
git commit -m "feat: port activities content"
```

---

### Task 13: `content/roteiros.ts`

**Files:**
- Create: `content/roteiros.ts`

`ROTEIROS` PT day objects live at `dc.html` lines 1758–1780 (3 itineraries, for the Rio Negro/Macucus/Ajuricaba packages, in that order). The `ROT_EN` lookup dictionary (a flat PT-string → EN-string map applied to `label`/`title`/`body` at render time in the prototype) is fully known from line 1832 and given below in full — apply it directly here instead of at render time.

- [ ] **Step 1: Create the file with the type shape and the full `ROT_EN` dictionary**

```ts
import type { Locale } from '@/lib/types';

export interface ItineraryDay {
  n: string;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  img: string;
}

// Flat PT -> EN lookup, transcribed verbatim from dc.html line 1832 (ROT_EN).
const ROT_EN: Record<string, string> = {
  Chegada: 'Arrival',
  Rio: 'River',
  Anavilhanas: 'Anavilhanas',
  Partida: 'Departure',
  Cultura: 'Culture',
  Madadá: 'Madadá',
  'Travessia e primeiros passos na mata': 'The crossing and first steps in the forest',
  'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia. Fogueira ao anoitecer.':
    'Arrival in Novo Airão and a 15-minute crossing to the pier. Lunch at the house, a free afternoon on the deck and the forest and agroforestry trail at the end of the day. A fire at dusk.',
  'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.':
    'Arrival in Novo Airão and a 15-minute crossing to the pier. Lunch at the house, a free afternoon on the deck and the forest and agroforestry trail at the end of the day.',
  'Praia ou floresta alagada, e a noite no rio': 'Beach or flooded forest, and a night on the river',
  'Manhã de canoa, stand-up paddle e mergulho: na praia particular, na seca, ou entre os igapós, na cheia. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas.':
    'A morning of canoeing, stand-up paddle and swimming: on the private beach in the dry season, or among the igapós in the flood. Late afternoon, a boat trip for the sunset and night spotting among the islands.',
  'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.':
    'A morning of canoeing, stand-up paddle and swimming. Late afternoon, a boat trip for the sunset and night spotting among the Anavilhanas islands.',
  'Arquipélago e comunidade ribeirinha': 'Archipelago and riverside community',
  'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária. À noite, piracaia na praia, na época de seca.':
    'A full day in Anavilhanas National Park, with a visit to a traditional community and the option of lunch at the community-run restaurant. In the evening, piracaia on the beach during the dry season.',
  'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.':
    'A full day in Anavilhanas National Park, with a visit to a traditional community and the option of lunch at the community-run restaurant.',
  'Manhã livre e check-out': 'A free morning and check-out',
  'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.':
    'An unhurried breakfast, a last swim in the river and the crossing back to Novo Airão. Check-out at 12pm.',
  'Maravilhas culturais de Novo Airão': 'Cultural wonders of Novo Airão',
  'City tour pela Fundação Almerinda Malaquias, a Associação das Artesãs, a loja Waimiri Atroari e o Flutuante dos Botos. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia.':
    'A city tour of the Almerinda Malaquias Foundation, the Artisans Association, the Waimiri Atroari shop and the Floating Dolphin platform. In the afternoon, recreational fishing or the Arraia creek and the flour house. In the evening, piracaia on the beach.',
  'Grutas do Madadá': 'Madadá caves',
  'O passeio mais longo do roteiro: subida do Rio Negro em busca da Pedra Sanduíche, dos petroglifos e das Grutas do Madadá, com trilha de 1h15 e piquenique na mata.':
    'The longest excursion of the itinerary: up the Rio Negro in search of the Sandwich Rock, the petroglyphs and the Madadá caves, with a 1h15 trail and a picnic in the forest.',
  'Novo Airão e o Igarapé do Arraia': 'Novo Airão and the Arraia creek',
  'City tour cultural em Novo Airão pela manhã. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia, na época de seca.':
    'A cultural city tour of Novo Airão in the morning. In the afternoon, recreational fishing or the Arraia creek and the flour house. In the evening, piracaia on the beach during the dry season.',
};

function withEn(pt: string): Record<Locale, string> {
  return { pt, en: ROT_EN[pt] ?? pt };
}

// Raw PT day data transcribed verbatim from dc.html lines 1758-1780 (ROTEIROS),
// one array per package in order [Rio Negro (3 nights), Macucus (4 nights), Ajuricaba (5 nights)].
const ROTEIROS_PT: { n: string; label: string; title: string; body: string; img: string }[][] = [
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia. Fogueira ao anoitecer.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho: na praia particular, na seca, ou entre os igapós, na cheia. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária. À noite, piracaia na praia, na época de seca.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Cultura',
      title: 'Maravilhas culturais de Novo Airão',
      body: 'City tour pela Fundação Almerinda Malaquias, a Associação das Artesãs, a loja Waimiri Atroari e o Flutuante dos Botos. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia.',
      img: 'img/artesas.jpg',
    },
    {
      n: '05',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Madadá',
      title: 'Grutas do Madadá',
      body: 'O passeio mais longo do roteiro: subida do Rio Negro em busca da Pedra Sanduíche, dos petroglifos e das Grutas do Madadá, com trilha de 1h15 e piquenique na mata.',
      img: 'img/grutas-madada.jpg',
    },
    {
      n: '05',
      label: 'Cultura',
      title: 'Novo Airão e o Igarapé do Arraia',
      body: 'City tour cultural em Novo Airão pela manhã. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia, na época de seca.',
      img: 'img/artesas.jpg',
    },
    {
      n: '06',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
];

export const ROTEIROS: ItineraryDay[][] = ROTEIROS_PT.map((roteiro) =>
  roteiro.map((day) => ({
    n: day.n,
    label: withEn(day.label),
    title: withEn(day.title),
    body: withEn(day.body),
    img: day.img,
  }))
);
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/roteiros.ts
git commit -m "feat: port itinerary content"
```

---

### Task 14: Price quoting logic

**Files:**
- Create: `lib/pricing.ts`
- Test: `lib/pricing.test.ts`

Ported verbatim from `dc.html` lines 1882–1894 (the pricing branch inside `reservaVals()`), adapted to take explicit parameters instead of reading `this.state`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { quotePrice } from './pricing';

describe('quotePrice', () => {
  it('returns a placeholder when no season is selected yet', () => {
    const result = quotePrice({ packageIndex: 2, season: null, nights: 0, locale: 'pt' });
    expect(result).toEqual({ price: 'A definir', note: 'Selecione um período e um pacote.' });
  });

  it('flags Rio Negro as unavailable in the special season (its special price is null)', () => {
    const result = quotePrice({ packageIndex: 0, season: 'special', nights: 3, locale: 'pt' });
    expect(result.price).toBe('Sob consulta');
    expect(result.note).toContain('Rio Negro não opera em temporada especial');
  });

  it('quotes a flat price for a whole-house package (index != 3)', () => {
    const result = quotePrice({ packageIndex: 2, season: 'low', nights: 5, locale: 'pt' });
    expect(result.price).toBe('R$ 37.500');
    expect(result.note).toBe(
      'Uso exclusivo da casa, até 6 pessoas. Transfer Manaus–Novo Airão não incluso.'
    );
  });

  it('quotes per-night x nights for the Pouso package (index 3) once nights are known', () => {
    const result = quotePrice({ packageIndex: 3, season: 'low', nights: 4, locale: 'pt' });
    expect(result.price).toBe('R$ 24.000');
    expect(result.note).toBe('R$ 6.000 por diária × 4 noites, até 6 pessoas.');
  });

  it('quotes a per-night rate for the Pouso package when no nights are selected yet', () => {
    const result = quotePrice({ packageIndex: 3, season: 'low', nights: 0, locale: 'pt' });
    expect(result.price).toBe('R$ 6.000 /diária');
    expect(result.note).toBe('Valor por diária, até 6 pessoas.');
  });

  it('translates every branch to English', () => {
    const result = quotePrice({ packageIndex: 2, season: 'low', nights: 5, locale: 'en' });
    expect(result.price).toBe('R$ 37.500');
    expect(result.note).toBe(
      'Exclusive use of the house, up to 6 people. Manaus–Novo Airão transfer not included.'
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/pricing.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/pricing.ts`**

```ts
import { brl } from './format';
import { PRICES } from '@/content/packages';
import type { Season } from './season';
import type { Locale } from './types';

export interface PriceQuote {
  price: string;
  note: string;
}

export function quotePrice(params: {
  packageIndex: number;
  season: Season | null;
  nights: number;
  locale: Locale;
}): PriceQuote {
  const { packageIndex, season, nights, locale } = params;
  const EN = locale === 'en';
  const L = (pt: string, en: string) => (EN ? en : pt);

  if (!season) {
    return {
      price: L('A definir', 'To be defined'),
      note: L('Selecione um período e um pacote.', 'Select a date range and a package.'),
    };
  }

  const pr = PRICES[packageIndex];
  const v = pr[season];

  if (v === null) {
    return {
      price: L('Sob consulta', 'On request'),
      note: L(
        'O pacote Rio Negro não opera em temporada especial. Considere Macucus ou Ajuricaba.',
        'The Rio Negro package does not run in the special season. Consider Macucus or Ajuricaba.'
      ),
    };
  }

  if (packageIndex === 3) {
    const price = nights ? brl(v * nights) : brl(v) + L(' /diária', ' /night');
    const note = nights
      ? brl(v) +
        L(' por diária × ', ' per night × ') +
        nights +
        L(' noites, até 6 pessoas.', ' nights, up to 6 people.')
      : L('Valor por diária, até 6 pessoas.', 'Rate per night, up to 6 people.');
    return { price, note };
  }

  return {
    price: brl(v),
    note: L(
      'Uso exclusivo da casa, até 6 pessoas. Transfer Manaus–Novo Airão não incluso.',
      'Exclusive use of the house, up to 6 people. Manaus–Novo Airão transfer not included.'
    ),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/pricing.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts lib/pricing.test.ts
git commit -m "feat: port price quoting logic"
```

---

### Task 15: WhatsApp message builder

**Files:**
- Create: `lib/whatsapp.ts`
- Test: `lib/whatsapp.test.ts`

Ported verbatim from `dc.html` lines 1895–1906 (message body) and line 1925 (`waHref`).

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { buildWhatsAppMessage, buildWhatsAppLink } from './whatsapp';

describe('buildWhatsAppMessage', () => {
  it('composes the full PT message with dates, package, season, price, guest and transfer', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: '2026-08-10',
      checkOut: '2026-08-13',
      nights: 3,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: 'low',
      price: 'R$ 37.500',
      guestName: 'Ana Souza',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '4',
      transfer: 'van',
      notes: '',
    });

    expect(message).toBe(
      [
        'Olá! Gostaria de consultar disponibilidade no Pouso das Castanheiras.',
        '',
        'Período: 10/08/2026 a 13/08/2026 (3 noites)',
        'Pacote: Ajuricaba, 5 noites',
        'Temporada: Baixa temporada, R$ 37.500',
        'Hóspedes: 4',
        'Transfer: Van executiva (R$ 1.300 cada trecho)',
        '',
        'Nome: Ana Souza',
        'E-mail: ana@example.com',
        'Telefone: 11999999999',
      ].join('\n')
    );
  });

  it('falls back to "a informar" for missing guest fields and omits the notes block when empty', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: null,
      checkOut: null,
      nights: 0,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: null,
      price: 'A definir',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      pax: '4',
      transfer: 'depois',
      notes: '',
    });

    expect(message).toContain('Período: a definir');
    expect(message).toContain('Nome: a informar');
    expect(message).toContain('E-mail: a informar');
    expect(message).toContain('Telefone: a informar');
    expect(message).not.toContain('Temporada:');
  });

  it('appends an "Observações" block when notes are present', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: null,
      checkOut: null,
      nights: 0,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: null,
      price: 'A definir',
      guestName: 'Ana',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '2',
      transfer: 'depois',
      notes: 'Viajamos com um bebê de colo.',
    });

    expect(message.endsWith('Observações: Viajamos com um bebê de colo.')).toBe(true);
  });

  it('translates the whole message to English', () => {
    const message = buildWhatsAppMessage({
      locale: 'en',
      checkIn: '2026-08-10',
      checkOut: '2026-08-11',
      nights: 1,
      packageName: 'Ajuricaba',
      packageMeta: 'Package · 5 nights · suggested',
      season: 'low',
      price: 'R$ 6.000',
      guestName: 'Ana Souza',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '2',
      transfer: 'taxi',
      notes: '',
    });

    expect(message).toContain('Hello! I would like to check availability at Pouso das Castanheiras.');
    expect(message).toContain('Dates: 10/08/2026 to 11/08/2026 (1 night)');
    expect(message).toContain('Package: Ajuricaba, 5 nights');
    expect(message).toContain('Guests: 2');
    expect(message).toContain('Transfer: Cooperative taxi (R$ 1,100 round trip)');
  });
});

describe('buildWhatsAppLink', () => {
  it('builds a wa.me URL to the pousada number with the URL-encoded message', () => {
    const link = buildWhatsAppLink('Olá!\nTeste');
    expect(link).toBe('https://wa.me/5511942995588?text=Ol%C3%A1!%0ATeste');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/whatsapp.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/whatsapp.ts`**

```ts
import { fmtBr } from './format';
import { SEASON_LABEL, type Season } from './season';
import { TRANSFER_LABELS, type TransferKey } from '@/content/transfers';
import type { Locale } from './types';

const WHATSAPP_NUMBER = '5511942995588';

function stripPackageMeta(meta: string): string {
  return meta
    .replace('Pacote · ', '')
    .replace('Package · ', '')
    .replace(' · sugerido', '')
    .replace(' · suggested', '');
}

export interface WhatsAppMessageParams {
  locale: Locale;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  packageName: string;
  packageMeta: string;
  season: Season | null;
  price: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  pax: string;
  transfer: TransferKey;
  notes: string;
}

export function buildWhatsAppMessage(p: WhatsAppMessageParams): string {
  const EN = p.locale === 'en';
  const L = (pt: string, en: string) => (EN ? en : pt);
  const definedPlaceholder = L('A definir', 'To be defined');

  const lines: string[] = [
    L(
      'Olá! Gostaria de consultar disponibilidade no Pouso das Castanheiras.',
      'Hello! I would like to check availability at Pouso das Castanheiras.'
    ),
    '',
  ];

  lines.push(
    L('Período: ', 'Dates: ') +
      (p.checkIn && p.checkOut
        ? fmtBr(p.checkIn) +
          L(' a ', ' to ') +
          fmtBr(p.checkOut) +
          ' (' +
          p.nights +
          (p.nights === 1 ? L(' noite)', ' night)') : L(' noites)', ' nights)'))
        : p.checkIn
        ? L('a partir de ', 'from ') + fmtBr(p.checkIn)
        : L('a definir', 'to be defined'))
  );

  lines.push(L('Pacote: ', 'Package: ') + p.packageName + ', ' + stripPackageMeta(p.packageMeta));

  if (p.season) {
    lines.push(
      L('Temporada: ', 'Season: ') +
        SEASON_LABEL[p.season][p.locale] +
        (p.price !== definedPlaceholder ? ', ' + p.price : '')
    );
  }

  lines.push(L('Hóspedes: ', 'Guests: ') + p.pax);
  lines.push('Transfer: ' + TRANSFER_LABELS[p.transfer][p.locale]);
  lines.push('');
  lines.push(L('Nome: ', 'Name: ') + (p.guestName || L('a informar', 'to be provided')));
  lines.push('E-mail: ' + (p.guestEmail || L('a informar', 'to be provided')));
  lines.push(L('Telefone: ', 'Phone: ') + (p.guestPhone || L('a informar', 'to be provided')));

  if (p.notes) {
    lines.push('');
    lines.push(L('Observações: ', 'Notes: ') + p.notes);
  }

  return lines.join('\n');
}

export function buildWhatsAppLink(message: string): string {
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/whatsapp.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat: port WhatsApp message builder"
```

---

### Task 16: Reservation calendar logic

**Files:**
- Create: `lib/calendar.ts`
- Test: `lib/calendar.test.ts`

Ported verbatim from `dc.html` lines 1838–1868 (`pickDay`, `buildMonth`), adapted to pure functions that take the date range as an explicit argument instead of `this.state`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { pickDay, buildMonth } from './calendar';

describe('pickDay', () => {
  it('sets check-in when nothing is selected yet', () => {
    expect(pickDay({ checkIn: null, checkOut: null }, '2026-08-10')).toEqual({
      checkIn: '2026-08-10',
      checkOut: null,
    });
  });

  it('clears the range when clicking the check-in day again', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-10')).toEqual({
      checkIn: null,
      checkOut: null,
    });
  });

  it('sets check-out when clicking a later day than check-in', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-15')).toEqual({
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
    });
  });

  it('reorders the range when clicking an earlier day than check-in', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-05')).toEqual({
      checkIn: '2026-08-05',
      checkOut: '2026-08-10',
    });
  });

  it('starts a new range when a complete range is already selected', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: '2026-08-15' }, '2026-09-01')).toEqual({
      checkIn: '2026-09-01',
      checkOut: null,
    });
  });
});

describe('buildMonth', () => {
  const today = new Date(2026, 0, 15); // Jan 15 2026

  it('labels the month in Portuguese and pads leading empty cells for the weekday offset', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    expect(month.label).toBe('Janeiro 2026');
    // Jan 1 2026 is a Thursday: 4 empty cells before day 1, then 31 days.
    expect(month.days).toHaveLength(4 + 31);
    expect(month.days.slice(0, 4)).toEqual([
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
    ]);
  });

  it('marks days before today as past and disables selection', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    const day10 = month.days[4 + 9]; // index of day "10"
    expect(day10).toEqual({ day: '10', iso: '2026-01-10', state: 'past' });
  });

  it('marks today and future days as available when no range is selected', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    const day15 = month.days[4 + 14];
    const day20 = month.days[4 + 19];
    expect(day15).toEqual({ day: '15', iso: '2026-01-15', state: 'available' });
    expect(day20).toEqual({ day: '20', iso: '2026-01-20', state: 'available' });
  });

  it('marks check-in/check-out days as selected and days between them as inside the range', () => {
    const range = { checkIn: '2026-01-20', checkOut: '2026-01-25' };
    const month = buildMonth(new Date(2026, 0, 1), range, 'pt', today);
    expect(month.days[4 + 19]).toEqual({ day: '20', iso: '2026-01-20', state: 'selected' });
    expect(month.days[4 + 21]).toEqual({ day: '22', iso: '2026-01-22', state: 'inside' });
    expect(month.days[4 + 24]).toEqual({ day: '25', iso: '2026-01-25', state: 'selected' });
    expect(month.days[4 + 25]).toEqual({ day: '26', iso: '2026-01-26', state: 'available' });
  });

  it('labels the month in English', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'en', today);
    expect(month.label).toBe('January 2026');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/calendar.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/calendar.ts`**

```ts
import { iso } from './format';
import type { Locale } from './types';

export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

export function pickDay(range: DateRange, isoStr: string): DateRange {
  const { checkIn, checkOut } = range;
  if (!checkIn || (checkIn && checkOut)) return { checkIn: isoStr, checkOut: null };
  if (isoStr === checkIn) return { checkIn: null, checkOut: null };
  if (isoStr < checkIn) return { checkIn: isoStr, checkOut: checkIn };
  return { checkIn, checkOut: isoStr };
}

export type CalendarDayState = 'empty' | 'past' | 'selected' | 'inside' | 'available';

export interface CalendarDay {
  day: string;
  iso: string | null;
  state: CalendarDayState;
}

export interface CalendarMonth {
  label: string;
  days: CalendarDay[];
}

const MONTH_LABELS: Record<Locale, string[]> = {
  pt: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

export function buildMonth(
  base: Date,
  range: DateRange,
  locale: Locale,
  today: Date = new Date()
): CalendarMonth {
  const y = base.getFullYear();
  const m = base.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const cutoff = new Date(today);
  cutoff.setHours(0, 0, 0, 0);
  const { checkIn, checkOut } = range;

  const days: CalendarDay[] = [];
  for (let i = 0; i < startDow; i++) {
    days.push({ day: '', iso: null, state: 'empty' });
  }
  for (let d = 1; d <= daysIn; d++) {
    const dt = new Date(y, m, d);
    const s = iso(dt);
    const past = dt < cutoff;
    const isSelected = s === checkIn || s === checkOut;
    const inside = !!(checkIn && checkOut && s > checkIn && s < checkOut);
    let state: CalendarDayState = 'available';
    if (past) state = 'past';
    else if (isSelected) state = 'selected';
    else if (inside) state = 'inside';
    days.push({ day: String(d), iso: s, state });
  }

  return { label: MONTH_LABELS[locale][m] + ' ' + y, days };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/calendar.test.ts
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/calendar.ts lib/calendar.test.ts
git commit -m "feat: port reservation calendar logic"
```

---

### Task 17: Header scroll-appearance logic

**Files:**
- Create: `lib/headerAppearance.ts`
- Test: `lib/headerAppearance.test.ts`

Ported verbatim from `dc.html` lines 1936–2009 (`onScroll` / `paintHeader`), extracting the pure decision (given scroll position and whether a dark hero is still on screen, what should the header look like) from the DOM-mutating original.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { computeHeaderAppearance } from './headerAppearance';

describe('computeHeaderAppearance', () => {
  it('is transparent and dark-mode (light text) at the top of a page with a dark hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 0, heroBottom: 800 });
    expect(appearance).toEqual({
      solid: false,
      dark: true,
      background: 'transparent',
      backdropFilter: 'none',
      boxShadow: 'none',
      ink: '#FBF9F5',
    });
  });

  it('turns solid and switches to dark ink once scrolled past the hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 300, heroBottom: 50 });
    expect(appearance).toEqual({
      solid: true,
      dark: false,
      background: 'rgba(251,249,245,.92)',
      backdropFilter: 'blur(14px) saturate(1.1)',
      boxShadow: '0 1px 0 rgba(42,28,18,.09)',
      ink: '#2A1C12',
    });
  });

  it('treats a page with no dark hero (e.g. Tarifas) as light-mode even at scrollY 0', () => {
    const appearance = computeHeaderAppearance({ scrollY: 0, heroBottom: null });
    expect(appearance.dark).toBe(false);
    expect(appearance.solid).toBe(false);
    expect(appearance.background).toBe('transparent');
  });

  it('goes solid past the 40px scroll threshold on a page without a dark hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 41, heroBottom: null });
    expect(appearance.solid).toBe(true);
    expect(appearance.dark).toBe(false);
    expect(appearance.boxShadow).toBe('0 1px 0 rgba(42,28,18,.09)');
  });

  it('uses the 120px hero-bottom threshold, not 0', () => {
    expect(computeHeaderAppearance({ scrollY: 0, heroBottom: 121 }).dark).toBe(true);
    expect(computeHeaderAppearance({ scrollY: 0, heroBottom: 120 }).dark).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run lib/headerAppearance.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/headerAppearance.ts`**

```ts
export interface HeaderAppearanceInput {
  scrollY: number;
  /**
   * Distance in px from the viewport top to the bottom of the page's
   * `[data-dark-hero]` element, or null if the current page has no dark hero
   * (e.g. Tarifas, Mídia).
   */
  heroBottom: number | null;
}

export interface HeaderAppearance {
  solid: boolean;
  dark: boolean;
  background: string;
  backdropFilter: string;
  boxShadow: string;
  ink: string;
}

export function computeHeaderAppearance({ scrollY, heroBottom }: HeaderAppearanceInput): HeaderAppearance {
  const dark = heroBottom !== null && heroBottom > 120;
  const solid = scrollY > 40;
  return {
    solid,
    dark,
    background: solid ? (dark ? 'rgba(26,22,17,.55)' : 'rgba(251,249,245,.92)') : 'transparent',
    backdropFilter: solid ? 'blur(14px) saturate(1.1)' : 'none',
    boxShadow: solid && !dark ? '0 1px 0 rgba(42,28,18,.09)' : 'none',
    ink: dark ? '#FBF9F5' : '#2A1C12',
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run lib/headerAppearance.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Run the full test suite before moving to UI work**

```bash
npm run test
```

Expected: all tests across `lib/*.test.ts` pass (format, season, pricing, whatsapp, calendar, headerAppearance).

- [ ] **Step 6: Commit**

```bash
git add lib/headerAppearance.ts lib/headerAppearance.test.ts
git commit -m "feat: port header scroll-appearance logic"
```

---

## Phase 3 — Internationalization plumbing

### Task 18: `next-intl` routing and middleware

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`
- Create: `messages/pt.json`
- Create: `messages/en.json`

Content pt/en pairs already live inside the typed content modules (Tasks 9–13). `messages/*.json` here only holds **static chrome strings** that aren't tied to a content entity: nav labels, buttons, footer, form labels, generic UI text. These are collected from the `data-en` attributes scattered across `dc.html`'s markup for the header/footer/reservation form/step labels — as each page-assembly task in Phase 6 is implemented, add the strings it needs to both JSON files (this task only sets up the plumbing and the labels needed by the header/footer built in Phase 4).

- [ ] **Step 1: Install `next-intl`**

```bash
npm install next-intl
```

- [ ] **Step 2: Create `i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed', // pt has no prefix ("/"), en is prefixed ("/en")
});
```

- [ ] **Step 3: Create `i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Create `middleware.ts` at the project root**

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 5: Create `messages/pt.json` with the header/footer chrome strings**

```json
{
  "nav": {
    "home": "Início",
    "casa": "A Casa",
    "experiencias": "Experiências",
    "chegar": "Como Chegar",
    "tarifas": "Tarifas",
    "reserva": "Reservar",
    "midia": "Mídia"
  },
  "header": {
    "cta": "Reservar",
    "whatsapp": "WhatsApp"
  },
  "footer": {
    "instagram": "Instagram",
    "whatsapp": "WhatsApp",
    "email": "E-mail"
  }
}
```

- [ ] **Step 6: Create `messages/en.json` with the same keys translated**

```json
{
  "nav": {
    "home": "Home",
    "casa": "The House",
    "experiencias": "Experiences",
    "chegar": "Getting Here",
    "tarifas": "Rates",
    "reserva": "Book",
    "midia": "Press"
  },
  "header": {
    "cta": "Book",
    "whatsapp": "WhatsApp"
  },
  "footer": {
    "instagram": "Instagram",
    "whatsapp": "WhatsApp",
    "email": "Email"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add i18n/ middleware.ts messages/
git commit -m "feat: configure next-intl routing, middleware and base messages"
```

---

### Task 19: Locale-aware root layout

**Files:**
- Delete: `app/layout.tsx` (from Task 5 — its content moves under `[locale]`)
- Delete: `app/page.tsx` (the `create-next-app` placeholder home page)
- Create: `app/[locale]/layout.tsx`
- Create: `app/layout.tsx` (minimal passthrough shell required by Next.js at the true root)

- [ ] **Step 1: Move the font/metadata setup from Task 5 into `app/[locale]/layout.tsx`, adding the `next-intl` provider**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { Petrona, Jost } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';

const petrona = Petrona({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-petrona',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
});

export const metadata: Metadata = {
  title: 'Pouso das Castanheiras',
  description:
    'Pousada de uso exclusivo em 26 hectares de floresta às margens do Rio Negro, em Novo Airão (AM).',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body className={`${petrona.variable} ${jost.variable}`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/layout.tsx` at the true root with the minimal shell Next.js requires (this one is never rendered directly once `middleware.ts` routes everything under `[locale]`, but the file must exist)**

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 3: Delete the placeholder home page** (Task 23 creates the real one under `app/[locale]/page.tsx`)

```bash
rm app/page.tsx
```

- [ ] **Step 4: Smoke-test both locales**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000       # expect 404 for now (no page.tsx under [locale] yet)
curl -s -I http://localhost:3000/en | head -1                          # expect a valid HTTP response line
kill %1
```

Expected: no server crash — 404s are fine at this point since Task 23 hasn't created the home page yet; the goal here is confirming the locale-routing middleware and layout don't error.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: wire up locale-aware root layout"
```

---

## Phase 4 — Layout chrome (header, mobile menu, footer)

### Task 20: Header component

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Header.module.css`

Ported from `dc.html` lines 77–103 (markup) and the scroll behavior from Task 17's `computeHeaderAppearance`. Uses `next-intl`'s `useTranslations`/`Link` for nav labels and locale-aware links, and `usePathname` to detect the active nav item (replacing the prototype's `sync()` at line 2016).

- [ ] **Step 1: Create `components/layout/Header.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { computeHeaderAppearance } from '@/lib/headerAppearance';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/a-casa', key: 'casa' },
  { href: '/experiencias', key: 'experiencias' },
  { href: '/como-chegar', key: 'chegar' },
  { href: '/tarifas', key: 'tarifas' },
  { href: '/midia', key: 'midia' },
] as const;

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [appearance, setAppearance] = useState(() =>
    computeHeaderAppearance({ scrollY: 0, heroBottom: null })
  );

  useEffect(() => {
    function onScroll() {
      const hero = document.querySelector<HTMLElement>('[data-dark-hero]');
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : null;
      setAppearance(computeHeaderAppearance({ scrollY: window.scrollY, heroBottom }));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <header
      id="pc-header"
      className={styles.header}
      style={{
        background: appearance.background,
        backdropFilter: appearance.backdropFilter,
        boxShadow: appearance.boxShadow,
        color: appearance.ink,
      }}
    >
      <Link href="/" className={styles.brand}>
        Pouso das Castanheiras
      </Link>
      <nav id="pc-nav" className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.navLink}
            style={{
              opacity: pathname === item.href ? 1 : 0.6,
              borderBottom: pathname === item.href ? '1px solid currentColor' : '1px solid transparent',
            }}
          >
            {t(`nav.${item.key}`)}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <Link href={locale === 'pt' ? '/en' : '/'} locale={locale === 'pt' ? 'en' : 'pt'}>
          {locale === 'pt' ? 'EN' : 'PT'}
        </Link>
        <Link href="/reserva" className={styles.cta}>
          {t('header.cta')}
        </Link>
      </div>
    </header>
  );
}
```

Note: the mobile burger button and `<MobileMenu>` overlay are added in Task 21; this task only builds the desktop header shell and scroll-paint behavior. `i18n/navigation.ts` (the `Link`/`usePathname` helpers from `next-intl`) is created in the next step.

- [ ] **Step 2: Create `i18n/navigation.ts`** (required by the import above; standard `next-intl` navigation helpers bound to `routing`)

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3: Create `components/layout/Header.module.css`**

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--section-padding-x);
  transition: background .4s ease, box-shadow .4s ease, color .35s ease;
}

.brand {
  font-family: var(--font-petrona), serif;
  font-size: 18px;
  text-decoration: none;
  color: inherit;
}

.nav {
  display: flex;
  gap: clamp(18px, 2vw, 32px);
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
}

.navLink {
  font-family: var(--font-jost), sans-serif;
  font-size: 11.5px;
  letter-spacing: .17em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  padding-bottom: 4px;
  transition: opacity .35s ease, border-color .35s ease;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cta {
  font-family: var(--font-jost), sans-serif;
  font-size: 11.5px;
  letter-spacing: .19em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  border: 1px solid currentColor;
  border-radius: var(--radius-pill);
  padding: 10px 22px;
  transition: transform .4s var(--ease-standard);
}

.cta:hover {
  transform: translateY(-2px);
}

@media (max-width: 560px) {
  .cta {
    display: none;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx components/layout/Header.module.css i18n/navigation.ts
git commit -m "feat: build Header component with scroll-driven appearance"
```

---

### Task 21: Mobile menu

**Files:**
- Create: `components/layout/MobileMenu.tsx`
- Create: `components/layout/MobileMenu.module.css`
- Modify: `components/layout/Header.tsx` (add the burger button, wire open/close state)

Ported from `dc.html` lines 105–123 (markup), the ≤900px burger button rule and `@keyframes menuIn` from the README's responsiveness section, and `toggleMenu`/`closeMenu` (`dc.html` lines 2141–2142).

- [ ] **Step 1: Create `components/layout/MobileMenu.tsx`**

```tsx
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './MobileMenu.module.css';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/a-casa', key: 'casa' },
  { href: '/experiencias', key: 'experiencias' },
  { href: '/como-chegar', key: 'chegar' },
  { href: '/tarifas', key: 'tarifas' },
  { href: '/midia', key: 'midia' },
] as const;

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div id="pc-menu" data-open={open} className={styles.menu} onClick={onClose}>
      <button type="button" className={styles.close} aria-label="Fechar menu" onClick={onClose}>
        ✕
      </button>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.link} onClick={onClose}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <Link href="/reserva" className={styles.cta} onClick={onClose}>
          {t('header.cta')}
        </Link>
        <a href="https://wa.me/5511942995588" className={styles.whatsapp}>
          {t('header.whatsapp')}
        </a>
        <Link href={locale === 'pt' ? '/en' : '/'} locale={locale === 'pt' ? 'en' : 'pt'}>
          {locale === 'pt' ? 'EN' : 'PT'}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/layout/MobileMenu.module.css`**

```css
.menu {
  display: none;
}

@media (max-width: 900px) {
  .menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 28px;
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--hero-bg);
    color: var(--bg-primary);
  }

  .menu[data-open='false'] {
    display: none;
  }

  .menu[data-open='true'] {
    animation: menuIn .42s cubic-bezier(.2, .8, .2, 1);
  }
}

.close {
  position: absolute;
  top: 24px;
  right: 24px;
  background: none;
  border: 0;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
}

.nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.link {
  font-family: var(--font-petrona), serif;
  font-size: clamp(30px, 9vw, 42px);
  color: inherit;
  text-decoration: none;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.cta,
.whatsapp {
  font-family: var(--font-jost), sans-serif;
  font-size: 11.5px;
  letter-spacing: .19em;
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(251, 249, 245, .5);
  border-radius: var(--radius-pill);
  padding: 10px 22px;
}
```

- [ ] **Step 3: Add the burger button and open/close state to `Header.tsx`** — insert into the component body from Task 20:

```tsx
// add to the imports:
import { useState } from 'react';
import { MobileMenu } from './MobileMenu';

// inside Header(), alongside the existing `appearance` state:
const [menuOpen, setMenuOpen] = useState(false);

// replace the closing </header> tag's sibling output with:
```

Update the returned JSX so the burger button sits inside `.actions` (visible only ≤900px via CSS) and the menu renders as a sibling of `<header>`:

```tsx
      <div className={styles.actions}>
        <Link href={locale === 'pt' ? '/en' : '/'} locale={locale === 'pt' ? 'en' : 'pt'}>
          {locale === 'pt' ? 'EN' : 'PT'}
        </Link>
        <Link href="/reserva" className={styles.cta}>
          {t('header.cta')}
        </Link>
        <button
          type="button"
          id="pc-burger"
          className={styles.burger}
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
  );
}
```

(The final `</header>` above closes the `<header>` element from Task 20; `<MobileMenu>` is a sibling rendered right after it, so wrap the whole return in a fragment `<>...</>` if it isn't already.)

- [ ] **Step 4: Add the `.burger` rule to `Header.module.css`** (hidden by default, shown ≤900px, per the README breakpoint table)

```css
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 8px;
}

.burger span {
  width: 22px;
  height: 1px;
  background: currentColor;
}

@media (max-width: 900px) {
  .burger {
    display: flex;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add components/layout/MobileMenu.tsx components/layout/MobileMenu.module.css components/layout/Header.tsx components/layout/Header.module.css
git commit -m "feat: build mobile menu and wire up header burger button"
```

---

### Task 22: Footer

**Files:**
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/Footer.module.css`

Ported from `dc.html` lines 1540–1575.

- [ ] **Step 1: Create `components/layout/Footer.tsx`**

```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './Footer.module.css';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>Pouso das Castanheiras</div>
      <nav className={styles.links}>
        <a href="https://instagram.com/pouso.das.castanheiras" target="_blank" rel="noreferrer">
          {t('footer.instagram')}
        </a>
        <a href="https://wa.me/5511942995588" target="_blank" rel="noreferrer">
          {t('footer.whatsapp')}
        </a>
        <a href="mailto:contato@pousodascastanheiras.com.br">{t('footer.email')}</a>
      </nav>
      <div className={styles.copy}>
        © {new Date().getFullYear()} Pouso das Castanheiras — Novo Airão, AM
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Create `components/layout/Footer.module.css`**

```css
.footer {
  background: var(--ink);
  color: var(--on-dark-72);
  padding: var(--section-padding-y) var(--section-padding-x);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.brand {
  font-family: var(--font-petrona), serif;
  font-size: clamp(24px, 3vw, 34px);
  color: var(--bg-primary);
}

.links {
  display: flex;
  gap: 24px;
  font-family: var(--font-jost), sans-serif;
  font-size: 11.5px;
  letter-spacing: .17em;
  text-transform: uppercase;
}

.links a {
  color: inherit;
  text-decoration: none;
}

.copy {
  font-size: 12px;
  color: var(--on-dark-55);
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/Footer.tsx components/layout/Footer.module.css
git commit -m "feat: build Footer component"
```

---

## Phase 5 — Pages

Every task below follows the same pattern: create one page file under `app/[locale]/<route>/page.tsx` composed from section components under `components/<page>/`, each section referencing its exact `dc.html` line range (from the structural map at the top of this plan). Wire `Header` and `Footer` from Phase 4 into each page (or once into a shared `[locale]/layout.tsx` wrapper — see Task 23, Step 1, which settles this for all subsequent pages).

Verify every page task using the procedure in **"How to verify page-assembly tasks"** at the top of this document.

### Task 23: Home page

**Files:**
- Modify: `app/[locale]/layout.tsx` (render `<Header>`/`<Footer>` around `{children}`, settling the pattern every later page reuses)
- Create: `app/[locale]/page.tsx`
- Create: `components/home/Hero.tsx` (+ `.module.css`) — source: `dc.html` 127–160
- Create: `components/home/Manifesto.tsx` (+ `.module.css`) — source: `dc.html` 162–174
- Create: `components/home/Mosaic.tsx` (+ `.module.css`) — source: `dc.html` 176–238
- Create: `components/home/Gastronomia.tsx` (+ `.module.css`) — source: `dc.html` 240–280
- Create: `components/home/Estacoes.tsx` (+ `.module.css`) — source: `dc.html` 282–308
- Create: `components/home/ExperienciasDestaque.tsx` (+ `.module.css`) — source: `dc.html` 310–342
- Create: `components/home/Imprensa.tsx` (+ `.module.css`) — source: `dc.html` 344–396, content from `content/press.ts` (Task 11)
- Create: `components/home/Depoimentos.tsx` (+ `.module.css`) — source: `dc.html` 398–424
- Create: `components/home/ChamadaFinal.tsx` (+ `.module.css`) — source: `dc.html` 426–439

- [ ] **Step 1: Wire `Header`/`Footer` into `app/[locale]/layout.tsx`** — inside the existing `<NextIntlClientProvider>` from Task 19, wrap `{children}`:

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// ...
        <NextIntlClientProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
```

- [ ] **Step 2: Build each of the 9 home-page section components listed above.** For each: open `dc.html` at the given line range side by side, recreate the markup as JSX using semantic HTML, style it with a CSS module using the design tokens from `app/globals.css` (colors, `clamp()` type scale, spacing — see the README's tables), and reproduce the documented motion (Ken Burns `kb` keyframe on the hero image, `fadeUp` on hero content, `.35s`–`.5s ease` color/opacity transitions, `scale(1.05)` image hover zoom at `1.4s cubic-bezier(.2,.8,.2,1)`). The hero's 4-photo crossfade (`dc.html` 128–160, timer at 1947–1955) becomes a small client component with a `useEffect` interval that cycles an `opacity` state across 4 stacked `<Image>` layers every 6.5s, matching the prototype's timer.

- [ ] **Step 3: Assemble `app/[locale]/page.tsx`**

```tsx
import { Hero } from '@/components/home/Hero';
import { Manifesto } from '@/components/home/Manifesto';
import { Mosaic } from '@/components/home/Mosaic';
import { Gastronomia } from '@/components/home/Gastronomia';
import { Estacoes } from '@/components/home/Estacoes';
import { ExperienciasDestaque } from '@/components/home/ExperienciasDestaque';
import { Imprensa } from '@/components/home/Imprensa';
import { Depoimentos } from '@/components/home/Depoimentos';
import { ChamadaFinal } from '@/components/home/ChamadaFinal';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Mosaic />
      <Gastronomia />
      <Estacoes />
      <ExperienciasDestaque />
      <Imprensa />
      <Depoimentos />
      <ChamadaFinal />
    </>
  );
}
```

- [ ] **Step 4: Verify** using the procedure at the top of this document, for both `/` (pt) and `/en` (en).

- [ ] **Step 5: Commit**

```bash
git add app/ components/home/ components/layout/
git commit -m "feat: build home page"
```

---

### Task 24: A Casa page

**Files:**
- Create: `app/[locale]/a-casa/page.tsx`
- Create: `components/casa/Hero.tsx` (+ `.module.css`) — source: `dc.html` 445–455
- Create: `components/casa/Intro.tsx` (+ `.module.css`) — source: `dc.html` 457–496 (quad gallery + stats)
- Create: `components/casa/HouseMosaic.tsx` (+ `.module.css`) — source: `dc.html` 498–548
- Create: `components/casa/Amenities.tsx` (+ `.module.css`) — source: `dc.html` 550–612
- Create: `components/casa/Team.tsx` (+ `.module.css`) — source: `dc.html` 614–629

- [ ] **Step 1: Build the 5 section components**, same method as Task 23 Step 2.

- [ ] **Step 2: Assemble `app/[locale]/a-casa/page.tsx`**

```tsx
import { Hero } from '@/components/casa/Hero';
import { Intro } from '@/components/casa/Intro';
import { HouseMosaic } from '@/components/casa/HouseMosaic';
import { Amenities } from '@/components/casa/Amenities';
import { Team } from '@/components/casa/Team';

export default function CasaPage() {
  return (
    <>
      <Hero />
      <Intro />
      <HouseMosaic />
      <Amenities />
      <Team />
    </>
  );
}
```

- [ ] **Step 3: Verify** for `/a-casa` and `/en/a-casa`.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/a-casa/ components/casa/
git commit -m "feat: build A Casa page"
```

---

### Task 25: Experiências page

**Files:**
- Create: `app/[locale]/experiencias/page.tsx`
- Create: `components/experiencias/Intro.tsx` (+ `.module.css`) — source: `dc.html` 635–643
- Create: `components/experiencias/ActivityGrid.tsx` (+ `.module.css`) — source: `dc.html` 645–725 (both groups: "na propriedade" 645–676, "Anavilhanas e Novo Airão" 678–725), reading from `content/activities.ts`
- Create: `components/experiencias/ActivityDrawer.tsx` (+ `.module.css`) — source: `dc.html` 1627–1679 (shared drawer markup) and `dc.html` 2076–2123 (open/close/props logic)
- Create: `components/experiencias/CtaBanner.tsx` (+ `.module.css`) — source: `dc.html` 728–739

- [ ] **Step 1: Build `Intro` and `CtaBanner`** (static sections, same method as prior tasks).

- [ ] **Step 2: Build `ActivityGrid`**, mapping over `ACTIVITIES` from `content/activities.ts` (Task 12) to render the 9 cards in their two groups (indices 0–2 "na propriedade", 3–8 "Anavilhanas e Novo Airão", per the source split). Each card's `onClick` sets which activity index is open (local `useState<number | null>` in the page, passed down).

- [ ] **Step 3: Build `ActivityDrawer`** as a controlled component: `{ activity: Activity | null; onClose: () => void }`. Reproduce the `slideIn` entry animation (`@keyframes slideIn`, defined in Task 4's `globals.css`) and show image, duration, season, packages, body, quote, and a "Reservar" link to `/reserva`.

- [ ] **Step 4: Assemble `app/[locale]/experiencias/page.tsx`** as a client component holding the open-activity state:

```tsx
'use client';

import { useState } from 'react';
import { Intro } from '@/components/experiencias/Intro';
import { ActivityGrid } from '@/components/experiencias/ActivityGrid';
import { ActivityDrawer } from '@/components/experiencias/ActivityDrawer';
import { CtaBanner } from '@/components/experiencias/CtaBanner';
import { ACTIVITIES } from '@/content/activities';

export default function ExperienciasPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Intro />
      <ActivityGrid onSelect={setOpenIndex} />
      <CtaBanner />
      <ActivityDrawer
        activity={openIndex !== null ? ACTIVITIES[openIndex] : null}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
```

- [ ] **Step 5: Verify** for `/experiencias` and `/en/experiencias`, including opening/closing the drawer for at least one activity from each of the two groups.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/experiencias/ components/experiencias/
git commit -m "feat: build Experiencias page with activity drawer"
```

---

### Task 26: Como Chegar page

**Files:**
- Create: `app/[locale]/como-chegar/page.tsx`
- Create: `components/chegar/Intro.tsx` (+ `.module.css`) — source: `dc.html` 745–753
- Create: `components/chegar/RouteMap.tsx` (+ `.module.css`) — source: `dc.html` 755–764 (iframe embedding `public/route-map.html` from Task 3)
- Create: `components/chegar/Stages.tsx` (+ `.module.css`) — source: `dc.html` 766–800
- Create: `components/chegar/SeaplaneFeature.tsx` (+ `.module.css`) — source: `dc.html` 802–835 (includes `<video src="/video/hidroaviao.mp4">`, no autoplay, native controls, per the README)
- Create: `components/chegar/TransferOptions.tsx` (+ `.module.css`) — source: `dc.html` 837–889
- Create: `components/chegar/TransferPlaceholder.tsx` (+ `.module.css`) — replaces the prototype's `<image-slot>` custom element (not part of `support.js`, not portable) for the 3 transfers still missing real photos (táxi, van, hidroavião parado — see README "Faltando")
- Create: `components/chegar/Faq.tsx` (+ `.module.css`) — source: `dc.html` 891–913
- Create: `components/chegar/OrganizeSteps.tsx` (+ `.module.css`) — source: `dc.html` 915–948

- [ ] **Step 1: Build `TransferPlaceholder` first** — a simple component rendering a `sand`-bordered box with a camera/upload icon and the caption "Foto em breve" / "Photo coming soon" (`data-en`), sized to match the transfer card image slot. `TransferOptions` renders this in place of the 3 missing photos (táxi, van, hidroavião parado) and a real `<Image>` for any transfer that already has a photo in `public/img/`.

- [ ] **Step 2: Build `RouteMap`**

```tsx
export function RouteMap() {
  return (
    <iframe
      src="/route-map.html"
      title="Mapa do trajeto Manaus–Novo Airão–Pouso das Castanheiras"
      style={{ width: '100%', height: 'clamp(380px, 58vh, 620px)', border: 0, display: 'block' }}
    />
  );
}
```

- [ ] **Step 3: Build the remaining 6 section components**, same method as prior page tasks.

- [ ] **Step 4: Assemble `app/[locale]/como-chegar/page.tsx`**

```tsx
import { Intro } from '@/components/chegar/Intro';
import { RouteMap } from '@/components/chegar/RouteMap';
import { Stages } from '@/components/chegar/Stages';
import { SeaplaneFeature } from '@/components/chegar/SeaplaneFeature';
import { TransferOptions } from '@/components/chegar/TransferOptions';
import { Faq } from '@/components/chegar/Faq';
import { OrganizeSteps } from '@/components/chegar/OrganizeSteps';

export default function ComoChegarPage() {
  return (
    <>
      <Intro />
      <RouteMap />
      <Stages />
      <SeaplaneFeature />
      <TransferOptions />
      <Faq />
      <OrganizeSteps />
    </>
  );
}
```

- [ ] **Step 5: Verify** for `/como-chegar` and `/en/como-chegar`, specifically checking the map iframe renders (Leaflet/OSM, no API key needed) and the video plays with native controls without autoplaying.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/como-chegar/ components/chegar/
git commit -m "feat: build Como Chegar page"
```

---

### Task 27: Tarifas page

**Files:**
- Create: `app/[locale]/tarifas/page.tsx`
- Create: `components/tarifas/Intro.tsx` (+ `.module.css`) — source: `dc.html` 954–962
- Create: `components/tarifas/ViewToggle.tsx` (+ `.module.css`) — source: `dc.html` 964–970
- Create: `components/tarifas/TableView.tsx` (+ `.module.css`) — source: `dc.html` 972–1084, reading `content/packages.ts` + `content/activities.ts`
- Create: `components/tarifas/CardsView.tsx` (+ `.module.css`) — source: `dc.html` 1086–1138
- Create: `components/tarifas/RoteiroView.tsx` (+ `.module.css`) — source: `dc.html` 1140–1164, reading `content/roteiros.ts`
- Create: `components/tarifas/PackageModal.tsx` (+ `.module.css`) — source: `dc.html` 1577–1625 and logic at 2094–2110
- Create: `components/tarifas/IncludedNotIncluded.tsx` (+ `.module.css`) — source: `dc.html` 1166–1187
- Create: `components/tarifas/Policy.tsx` (+ `.module.css`) — source: `dc.html` 1189–1226

- [ ] **Step 1: Build `TableView`, `CardsView`, `RoteiroView`** reading from `PACKAGES`/`PRICES` (Task 10), `ACTIVITIES` (Task 12) and `ROTEIROS` (Task 13). `TableView` needs `overflow-x: auto` and `min-width: 860px` on its `<table>` per the README's mobile behavior note.

- [ ] **Step 2: Build `PackageModal`** as a controlled component `{ packageIndex: number | null; onClose: () => void }`, showing the package's name/meta/image/body, its included activities (via `PACKAGES[i].acts` indices into `ACTIVITIES`), and low/high/special prices from `PRICES[i]`.

- [ ] **Step 3: Build `Intro`, `ViewToggle`, `IncludedNotIncluded`, `Policy`**, same method as prior tasks. `ViewToggle` is `position: sticky` per the spec (README "Tarifas" section).

- [ ] **Step 4: Assemble `app/[locale]/tarifas/page.tsx`** as a client component holding `view` (`'tabela' | 'cards' | 'roteiro'`) and `openPackage` state:

```tsx
'use client';

import { useState } from 'react';
import { Intro } from '@/components/tarifas/Intro';
import { ViewToggle } from '@/components/tarifas/ViewToggle';
import { TableView } from '@/components/tarifas/TableView';
import { CardsView } from '@/components/tarifas/CardsView';
import { RoteiroView } from '@/components/tarifas/RoteiroView';
import { PackageModal } from '@/components/tarifas/PackageModal';
import { IncludedNotIncluded } from '@/components/tarifas/IncludedNotIncluded';
import { Policy } from '@/components/tarifas/Policy';

type View = 'tabela' | 'cards' | 'roteiro';

export default function TarifasPage() {
  const [view, setView] = useState<View>('tabela');
  const [openPackage, setOpenPackage] = useState<number | null>(null);

  return (
    <>
      <Intro />
      <ViewToggle view={view} onChange={setView} />
      {view === 'tabela' && <TableView />}
      {view === 'cards' && <CardsView onSelect={setOpenPackage} />}
      {view === 'roteiro' && <RoteiroView />}
      <IncludedNotIncluded />
      <Policy />
      <PackageModal packageIndex={openPackage} onClose={() => setOpenPackage(null)} />
    </>
  );
}
```

- [ ] **Step 5: Verify** for `/tarifas` and `/en/tarifas`, switching between all 3 views and opening a package modal from the cards view, at desktop and at ≤760px (table `overflow-x: auto`).

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/tarifas/ components/tarifas/
git commit -m "feat: build Tarifas page"
```

---

### Task 28: Reserva page

**Files:**
- Create: `app/[locale]/reserva/page.tsx`
- Create: `components/reserva/Calendar.tsx` (+ `.module.css`) — source: `dc.html` 1248–1281, using `lib/calendar.ts` (Task 16)
- Create: `components/reserva/PackageStep.tsx` (+ `.module.css`) — source: `dc.html` 1283–1303, using `content/packages.ts`
- Create: `components/reserva/TransferStep.tsx` (+ `.module.css`) — source: `dc.html` 1305–1328, using `content/transfers.ts`
- Create: `components/reserva/DetailsForm.tsx` (+ `.module.css`) — source: `dc.html` 1330–1360
- Create: `components/reserva/SummaryAside.tsx` (+ `.module.css`) — source: `dc.html` 1363–1396, using `lib/pricing.ts` and `lib/whatsapp.ts`

This is the most important page in this plan — it's where every pure function from Phase 2 gets wired to real UI, reproducing the prototype's reservation flow exactly, including the working `wa.me` submission.

- [ ] **Step 1: Build `Calendar`** — two months side by side, calling `buildMonth(base, range, locale)` and `buildMonth(next, range, locale)` for month offset `monthOffset`/`monthOffset + 1`, rendering each `CalendarDay` with the state-to-style mapping: `past` → disabled + `color: var(--text-disabled)`, `selected` → `background: var(--ink); color: var(--bg-primary)`, `inside` → `background: var(--sand-dark)`, `available`/`empty` per source. Clicking a day (when not `past`/`empty`) calls `pickDay(range, day.iso)` and updates the range in the parent (Step 5).

- [ ] **Step 2: Build `PackageStep`** — 4 selectable cards from `PACKAGES`, `Ajuricaba` (index 2) selected by default, matching the prototype's `pkgSel: 2` initial state (`dc.html` line 1836).

- [ ] **Step 3: Build `TransferStep`** — 4 selectable options from `TRANSFER_LABELS`/`TRANSFER_ORDER`, `'depois'` selected by default (matches `dc.html` line 1836).

- [ ] **Step 4: Build `DetailsForm`** — controlled inputs for `nome`, `email`, `tel`, `pax` (1–6), `obs`, matching field names/labels from `dc.html` 1330–1360.

- [ ] **Step 5: Build `SummaryAside`** and assemble `app/[locale]/reserva/page.tsx` as the client component owning all reservation state, computing derived values, and rendering the WhatsApp preview/send button:

```tsx
'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Calendar } from '@/components/reserva/Calendar';
import { PackageStep } from '@/components/reserva/PackageStep';
import { TransferStep } from '@/components/reserva/TransferStep';
import { DetailsForm } from '@/components/reserva/DetailsForm';
import { SummaryAside } from '@/components/reserva/SummaryAside';
import { pickDay, buildMonth, type DateRange } from '@/lib/calendar';
import { season } from '@/lib/season';
import { quotePrice } from '@/lib/pricing';
import { buildWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { fromIso } from '@/lib/format';
import { PACKAGES } from '@/content/packages';
import type { TransferKey } from '@/content/transfers';
import type { Locale } from '@/lib/types';

export default function ReservaPage() {
  const locale = useLocale() as Locale;
  const [range, setRange] = useState<DateRange>({ checkIn: null, checkOut: null });
  const [monthOffset, setMonthOffset] = useState(0);
  const [pkgSel, setPkgSel] = useState(2);
  const [transfer, setTransfer] = useState<TransferKey>('depois');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [pax, setPax] = useState('4');
  const [obs, setObs] = useState('');

  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const next = new Date(base.getFullYear(), base.getMonth() + 1, 1);

  const nights =
    range.checkIn && range.checkOut
      ? Math.round((fromIso(range.checkOut).getTime() - fromIso(range.checkIn).getTime()) / 86400000)
      : 0;
  const currentSeason = range.checkIn ? season(range.checkIn) : null;
  const pkg = PACKAGES[pkgSel];
  const { price, note } = quotePrice({ packageIndex: pkgSel, season: currentSeason, nights, locale });

  const message = buildWhatsAppMessage({
    locale,
    checkIn: range.checkIn,
    checkOut: range.checkOut,
    nights,
    packageName: pkg.name[locale],
    packageMeta: pkg.meta[locale],
    season: currentSeason,
    price,
    guestName: nome,
    guestEmail: email,
    guestPhone: tel,
    pax,
    transfer,
    notes: obs,
  });
  const whatsappLink = buildWhatsAppLink(message);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.55fr .9fr', gap: 'var(--content-gap)' }}>
      <div>
        <Calendar
          months={[buildMonth(base, range, locale), buildMonth(next, range, locale)]}
          onPrevMonth={() => setMonthOffset((o) => Math.max(0, o - 1))}
          onNextMonth={() => setMonthOffset((o) => o + 1)}
          onPickDay={(isoStr) => setRange((r) => pickDay(r, isoStr))}
        />
        <PackageStep selected={pkgSel} onSelect={setPkgSel} />
        <TransferStep selected={transfer} onSelect={setTransfer} />
        <DetailsForm
          nome={nome}
          email={email}
          tel={tel}
          pax={pax}
          obs={obs}
          onChangeNome={setNome}
          onChangeEmail={setEmail}
          onChangeTel={setTel}
          onChangePax={setPax}
          onChangeObs={setObs}
        />
      </div>
      <SummaryAside
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        nights={nights}
        packageName={pkg.name[locale]}
        season={currentSeason}
        pax={pax}
        transfer={transfer}
        price={price}
        priceNote={note}
        message={message}
        whatsappLink={whatsappLink}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verify** the full flow manually for `/reserva` and `/en/reserva`: pick a check-in/check-out spanning at least one full month boundary, confirm the season/price update, switch package and transfer, fill the form, confirm the `<pre>` message preview matches what `lib/whatsapp.test.ts` expects for equivalent inputs, and click through to `wa.me` (don't actually send the message — just confirm the URL opens with the pre-filled text).

- [ ] **Step 7: Commit**

```bash
git add app/[locale]/reserva/ components/reserva/
git commit -m "feat: build Reserva page wired to reservation logic"
```

---

### Task 29: Mídia page

**Files:**
- Create: `app/[locale]/midia/page.tsx`
- Create: `components/midia/Intro.tsx` (+ `.module.css`) — source: `dc.html` 1404–1412
- Create: `components/midia/FeaturedArticle.tsx` (+ `.module.css`) — source: `dc.html` 1414–1423
- Create: `components/midia/Videos.tsx` (+ `.module.css`) — source: `dc.html` 1425–1448
- Create: `components/midia/ArticleGrid.tsx` (+ `.module.css`) — source: `dc.html` 1450–1536

- [ ] **Step 1: Build the 4 section components**, same method as prior page tasks. `ArticleGrid` links out to the 6 external articles (PANROTAS, CNN Brasil, Revista Hotéis, Now Boarding, Guia do Turismo Brasil, Paes pelo Mundo) with `target="_blank" rel="noreferrer"`.

- [ ] **Step 2: Assemble `app/[locale]/midia/page.tsx`**

```tsx
import { Intro } from '@/components/midia/Intro';
import { FeaturedArticle } from '@/components/midia/FeaturedArticle';
import { Videos } from '@/components/midia/Videos';
import { ArticleGrid } from '@/components/midia/ArticleGrid';

export default function MidiaPage() {
  return (
    <>
      <Intro />
      <FeaturedArticle />
      <Videos />
      <ArticleGrid />
    </>
  );
}
```

- [ ] **Step 3: Verify** for `/midia` and `/en/midia`.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/midia/ components/midia/
git commit -m "feat: build Midia page"
```

---

## Phase 6 — Final verification and deploy

### Task 30: Full-site verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated test suite**

```bash
npm run test
npx tsc --noEmit
npm run lint
```

Expected: all green.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: builds successfully, no route errors, no missing-message warnings from `next-intl` for either locale.

- [ ] **Step 3: Manually walk every route in both locales** against the checklist in "How to verify page-assembly tasks": `/`, `/a-casa`, `/experiencias`, `/como-chegar`, `/tarifas`, `/reserva`, `/midia`, and their `/en/...` equivalents (14 routes total). Confirm at desktop, ≤900px (mobile menu), ≤760px (grid collapse), and ≤560px (header CTA hidden).

- [ ] **Step 4: Confirm the reservation flow end-to-end once more** (date range spanning a special-season boundary, e.g. Dec 20 → Jan 3, to see the `special` season / "Sob consulta" Rio Negro edge case from `lib/pricing.test.ts` reflected live).

- [ ] **Step 5: Fix anything found, committing each fix separately** with a message describing what was wrong (e.g. `fix: correct spacing on Casa amenities grid at 760px`).

---

### Task 31: Deploy to Vercel and push to GitHub

**Files:** none (deployment only)

- [ ] **Step 1: Push the branch to the GitHub remote** (confirm with the user before this step — it's the first push to a shared remote)

```bash
cd /Users/sciensa/Desktop/pouso-castanheiras
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel under the developer's personal account, Hobby plan** (per the approved spec — this is a validation deploy for the client, not the official production domain yet)

```bash
npx vercel --yes
```

Follow the prompts to link the project; accept the auto-detected Next.js settings.

- [ ] **Step 3: Confirm the deployed preview URL loads correctly** — repeat a subset of Task 30 Step 3's route walk against the live Vercel URL instead of `localhost`.

- [ ] **Step 4: Share the preview URL with the user for client review.**

---

## What's deliberately not in this plan

- No database, no Google Calendar integration, no email/WhatsApp notifications to the pousada, no availability blocking on the reservation calendar (every date still shows as bookable, exactly like the current prototype). That's the next plan, built on top of `lib/calendar.ts`, `lib/pricing.ts` and the Reserva page from Task 28 — the reservation submission will change from "just open `wa.me`" to "create a `Reservation` record + Google Calendar invite, then open `wa.me`."
- No admin panel, no payment integration — out of scope per the approved spec (`docs/superpowers/specs/2026-08-09-fundacao-reservas-design.md`).
- No production domain/hosting decision — Task 31 deploys to a personal Vercel Hobby account for client validation only.
