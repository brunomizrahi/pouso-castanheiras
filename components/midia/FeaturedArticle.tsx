import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './FeaturedArticle.module.css';

// dc.html 1414-1423: single full-bleed link card, image + gradient scrim + badge + headline.
// The badge text ("Revista Casa e Jardim · Fevereiro 2026") carries no data-en in dc.html,
// so it stays untranslated in both locales.
const COPY = {
  tag: 'Revista Casa e Jardim  ·  Fevereiro 2026',
  headline: {
    pt: 'Amigos constroem vila exclusiva para hospedagem em meio à floresta amazônica',
    en: 'Friends build an exclusive retreat in the heart of the Amazon rainforest',
  },
  href: 'https://revistacasaejardim.globo.com/viagem/hospedagem/noticia/2026/02/amigos-constroem-vila-exclusiva-para-hospedagem-em-meio-a-floresta-amazonica.ghtml',
} as const;

export async function FeaturedArticle() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <a href={COPY.href} target="_blank" rel="noopener" className={styles.card}>
        <Image src="/img/a04-1.jpg" alt="" fill sizes="100vw" className={styles.image} />
        <span className={styles.scrim} />
        <span className={styles.content}>
          <span className={styles.tag}>{COPY.tag}</span>
          <span className={styles.headline}>{COPY.headline[locale]}</span>
        </span>
      </a>
    </section>
  );
}
