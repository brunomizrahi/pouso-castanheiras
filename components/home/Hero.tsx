'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './Hero.module.css';

const SLIDES: { src: string; alt: Record<Locale, string> }[] = [
  { src: '/img/a02-1.jpg', alt: { pt: 'Rio Negro e floresta', en: 'Rio Negro and forest' } },
  { src: '/img/a16-1.jpg', alt: { pt: 'Canoa ao anoitecer', en: 'Canoe at dusk' } },
  { src: '/img/a12-2.jpg', alt: { pt: 'A casa à noite', en: 'The house at night' } },
  { src: '/img/a03-1.jpg', alt: { pt: 'Píer do Pouso', en: 'Pouso pier' } },
];

const COPY = {
  eyebrow: { pt: 'Amazônia · Rio Negro · Anavilhanas', en: 'Amazon · Rio Negro · Anavilhanas' },
  titleLine1: { pt: 'Uma casa dentro', en: 'A house inside' },
  titleLine2: { pt: 'da floresta', en: 'the forest' },
  body: {
    pt: 'São 26 hectares de mata preservada às margens do Rio Negro, em Novo Airão. A casa fica só para o seu grupo, até seis pessoas, com todas as refeições e os passeios já inclusos.',
    en: 'Twenty-six hectares of preserved forest on the banks of the Rio Negro, in Novo Airão. The house is yours alone, up to six guests, with every meal and excursion included.',
  },
  cta: { pt: 'Consultar datas', en: 'Check dates' },
  watch: { pt: 'Assistir', en: 'Watch' },
  explore: { pt: 'Explore', en: 'Explore' },
} as const satisfies Record<string, Record<Locale, string>>;

// The prototype (dc.html 127-160) crossfades 4 stacked photos every 6.5s
// (timer at dc.html 1947-1955) and applies the Ken Burns `kb` keyframe to
// only the first slide.
export function Hero() {
  const locale = useLocale() as Locale;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section data-dark-hero="true" className={styles.hero}>
      {SLIDES.map((slide, index) => (
        <div key={slide.src} className={styles.slide} style={{ opacity: index === active ? 1 : 0 }}>
          <Image
            src={slide.src}
            alt={slide.alt[locale]}
            fill
            priority={index === 0}
            sizes="100vw"
            className={index === 0 ? styles.imageKenBurns : styles.image}
          />
        </div>
      ))}
      <div className={styles.scrim} />
      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.eyebrow}>{COPY.eyebrow[locale]}</div>
          <h1 className={styles.title}>
            {COPY.titleLine1[locale]}
            <br />
            <em>{COPY.titleLine2[locale]}</em>
          </h1>
          <p className={styles.body}>{COPY.body[locale]}</p>
          <div className={styles.actions}>
            <Link href="/reserva" className={styles.primaryCta}>
              {COPY.cta[locale]}
            </Link>
            <button type="button" className={styles.secondaryCta}>
              <span className={styles.playIcon} aria-hidden="true">
                ▶
              </span>
              {COPY.watch[locale]}
            </button>
          </div>
        </div>
        <div className={styles.scrollCue}>
          <span className={styles.scrollLabel}>{COPY.explore[locale]}</span>
          <span className={styles.scrollLine} />
        </div>
      </div>
    </section>
  );
}
