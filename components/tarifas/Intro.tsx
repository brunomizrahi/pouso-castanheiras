'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import styles from './Intro.module.css';

// dc.html 954-962: eyebrow + h1 on the left, lead paragraph on the right, items aligned to the
// bottom. Client component (useLocale, not getLocale) — this page's tree holds `view` and
// `openPackage` state, so page.tsx is a 'use client' component that cannot import async Server
// Components.
const COPY = {
  eyebrow: { pt: 'Pacotes e tarifas 2026', en: 'Packages & rates 2026' },
  titleLine1: { pt: 'Quatro pacotes,', en: 'Four packages,' },
  titleLine2: { pt: 'uma casa inteira', en: 'one whole house' },
  body: {
    pt: 'Os valores são pela casa inteira, para até 6 pessoas, e já incluem todas as refeições, o serviço de camareira e as atividades de cada pacote.',
    en: "Rates are for the whole house, up to 6 people, and already include all meals, housekeeping and the activities in each package.",
  },
} as const satisfies Record<string, Record<Locale, string>>;

export function Intro() {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <div className={styles.eyebrow}>{COPY.eyebrow[locale]}</div>
          <h1 className={styles.title}>
            {COPY.titleLine1[locale]}
            <br />
            <em className={styles.em}>{COPY.titleLine2[locale]}</em>
          </h1>
        </div>
        <p className={styles.body}>{COPY.body[locale]}</p>
      </div>
    </section>
  );
}
