import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Hero.module.css';

// dc.html 445-455: a single dark hero photo (no slideshow, unlike the home Hero).
const COPY = {
  eyebrow: { pt: 'A Casa', en: 'The House' },
  titlePre: { pt: 'Uma construção de ', en: 'A building of ' },
  titleEm: { pt: 'baixo impacto', en: 'low impact' },
  body: {
    pt: 'Erguida em meio à floresta amazônica, a casa equilibra sofisticação e respeito às tradições ribeirinhas. Materiais locais, ventilação e iluminação naturais.',
    en: 'Built in the middle of the Amazon rainforest, the house balances sophistication with respect for riverside traditions. Local materials, natural ventilation and daylight.',
  },
  alt: { pt: 'A casa ao anoitecer', en: 'The house at dusk' },
} as const satisfies Record<string, Record<Locale, string>>;

export async function Hero() {
  const locale = (await getLocale()) as Locale;

  return (
    <section data-dark-hero="true" className={styles.hero}>
      <Image src="/img/a04-1.jpg" alt={COPY.alt[locale]} fill priority sizes="100vw" className={styles.image} />
      <div className={styles.scrim} />
      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.eyebrow}>{COPY.eyebrow[locale]}</div>
          <h1 className={styles.title}>
            {COPY.titlePre[locale]}
            <em>{COPY.titleEm[locale]}</em>
          </h1>
          <p className={styles.body}>{COPY.body[locale]}</p>
        </div>
      </div>
    </section>
  );
}
