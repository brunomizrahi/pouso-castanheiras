'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import styles from './Intro.module.css';

// dc.html 635-643: eyebrow + h1 on the left, lead paragraph on the right, items aligned to the bottom.
// Client component (useLocale, not getLocale) because this page needs shared open/close state
// with ActivityGrid/ActivityDrawer — a 'use client' page.tsx cannot import async Server Components.
const COPY = {
  eyebrow: { pt: 'Experiências', en: 'Experiences' },
  titleLine1: { pt: 'A floresta acontece', en: 'The forest happens' },
  titleLine2: { pt: 'sem sair de casa', en: 'without leaving home' },
  body: {
    pt: 'Estar dentro da floresta muda tudo. Quatro das atividades acontecem sem que você precise sair da propriedade. As outras são no arquipélago de Anavilhanas e em Novo Airão, com guias que vivem por aqui.',
    en: 'Being inside the forest changes everything. Four of the activities happen without leaving the property. The others are in the Anavilhanas archipelago and Novo Airão, with guides who live here.',
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
