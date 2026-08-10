import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Intro.module.css';

// dc.html 1404-1412: eyebrow + h1 on the left, lead paragraph on the right, bottom-aligned.
const COPY = {
  eyebrow: { pt: 'O Pouso na mídia', en: 'In the press' },
  titleLine1: { pt: 'O que escreveram', en: 'What they wrote' },
  titleLine2: { pt: 'sobre a casa', en: 'about the house' },
  body: {
    pt: 'Desde que abrimos, recebemos jornalistas de viagem e de gastronomia. Reunimos aqui o que eles escreveram sobre a casa.',
    en: 'Since we opened we have hosted travel and food journalists. Here is what they wrote about the house.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export async function Intro() {
  const locale = (await getLocale()) as Locale;

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
