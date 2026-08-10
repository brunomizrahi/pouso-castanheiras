'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PRESS_QUOTES } from '@/content/press';
import type { Locale } from '@/lib/types';
import styles from './Imprensa.module.css';

const COPY = {
  label: { pt: 'O Pouso na mídia', en: 'In the press' },
  allArticles: { pt: 'Todas as matérias', en: 'All articles' },
  video: { pt: 'Vídeo', en: 'Video' },
  article: {
    tag: { pt: 'Revista Casa e Jardim · Fev 2026', en: 'Revista Casa e Jardim · Feb 2026' },
    headline: {
      pt: 'Amigos constroem vila exclusiva para hospedagem em meio à floresta amazônica',
      en: 'Friends build an exclusive retreat in the heart of the Amazon rainforest',
    },
    href: 'https://revistacasaejardim.globo.com/viagem/hospedagem/noticia/2026/02/amigos-constroem-vila-exclusiva-para-hospedagem-em-meio-a-floresta-amazonica.ghtml',
  },
  videoCard: {
    headline: { pt: 'O Pouso das Castanheiras no YouTube', en: 'Pouso das Castanheiras on YouTube' },
    href: 'https://www.youtube.com/watch?v=PrzUBa5J218',
  },
} as const;

const OUTLETS = ['Casa e Jardim', 'CNN Brasil', 'PANROTAS', 'Revista Hotéis', 'Now Boarding', 'Guia do Turismo Brasil'];

export function Imprensa() {
  const locale = useLocale() as Locale;
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive((current) => (current + 1) % PRESS_QUOTES.length);
        setVisible(true);
      }, 450);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  function pickQuote(index: number) {
    setVisible(false);
    setTimeout(() => {
      setActive(index);
      setVisible(true);
    }, 450);
  }

  return (
    <section className={styles.section}>
      <div className={styles.labelWrap}>
        <div className={styles.label}>{COPY.label[locale]}</div>
      </div>

      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {OUTLETS.map((outlet) => (
              <span key={outlet}>{outlet}</span>
            ))}
          </div>
          <div className={styles.marqueeTrack} aria-hidden="true">
            {OUTLETS.map((outlet) => (
              <span key={outlet}>{outlet}</span>
            ))}
          </div>
        </div>
        <div className={styles.marqueeFade} />
      </div>

      <div className={styles.cardsWrap}>
        <div className={styles.cards}>
          <a href={COPY.article.href} target="_blank" rel="noopener" className={styles.articleCard}>
            <Image src="/img/a04-1.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.articlePhoto} />
            <span className={styles.articleScrim} />
            <span className={styles.articleContent}>
              <span className={styles.articleTag}>{COPY.article.tag[locale]}</span>
              <span className={styles.articleHeadline}>{COPY.article.headline[locale]}</span>
            </span>
          </a>
          <a href={COPY.videoCard.href} target="_blank" rel="noopener" className={`${styles.articleCard} ${styles.videoCard}`}>
            {/* External YouTube thumbnail host isn't configured in next.config image domains; a plain img avoids that config change. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://img.youtube.com/vi/PrzUBa5J218/maxresdefault.jpg" alt="" className={styles.videoThumb} />
            <span className={styles.articleScrim} />
            <span className={styles.articleContent}>
              <span className={styles.videoLabelRow}>
                <span className={styles.playIcon} aria-hidden="true">
                  ▶
                </span>
                <span className={styles.videoLabel}>{COPY.video[locale]}</span>
              </span>
              <span className={styles.articleHeadline}>{COPY.videoCard.headline[locale]}</span>
            </span>
          </a>
        </div>
      </div>

      <div className={styles.quoteWrap}>
        <blockquote className={styles.quote} style={{ opacity: visible ? 1 : 0 }}>
          {PRESS_QUOTES[active].quote[locale]}
        </blockquote>
        <div className={styles.source} style={{ opacity: visible ? 1 : 0 }}>
          {PRESS_QUOTES[active].source}
        </div>
        <div className={styles.dots}>
          {PRESS_QUOTES.map((quote, index) => (
            <button
              key={quote.source}
              type="button"
              aria-label={quote.source}
              className={styles.dot}
              data-active={index === active}
              onClick={() => pickQuote(index)}
            />
          ))}
        </div>
        <div className={styles.allArticles}>
          <Link href="/midia">{COPY.allArticles[locale]}</Link>
        </div>
      </div>
    </section>
  );
}
