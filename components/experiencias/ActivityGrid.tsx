'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import { ACTIVITIES } from '@/content/activities';
import styles from './ActivityGrid.module.css';

// dc.html 645-726: two groups. "Na propriedade" (indices 0-2, dc.html 645-676) uses a
// 12-col grid with two half-width cards and one full-width card, dark gradient overlay.
// "Anavilhanas e Novo Airão" (indices 3-8, dc.html 678-725) is a simple auto-fit grid of
// bordered white cards. Note: dc.html's third "na propriedade" card (Piracaia) also carries
// an inline teaser sentence baked into the markup that isn't a discrete field on the
// Activity type in content/activities.ts, so it isn't reproduced here — the full text is
// still shown in the drawer body.
const GROUP_LABELS = {
  property: { pt: 'Na propriedade', en: 'On the property' },
  anavilhanas: { pt: 'Anavilhanas e Novo Airão', en: 'Anavilhanas & Novo Airão' },
} as const satisfies Record<string, Record<Locale, string>>;

interface ActivityGridProps {
  onSelect: (index: number) => void;
}

export function ActivityGrid({ onSelect }: ActivityGridProps) {
  const locale = useLocale() as Locale;
  const property = ACTIVITIES.slice(0, 3);
  const anavilhanas = ACTIVITIES.slice(3);

  return (
    <section className={styles.section}>
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>{GROUP_LABELS.property[locale]}</span>
        <span className={styles.groupLine} />
      </div>
      <div className={styles.featuredGrid}>
        {property.map((activity, i) => (
          <button
            key={activity.n}
            type="button"
            onClick={() => onSelect(i)}
            className={`${styles.featuredCard} ${i === 2 ? styles.featuredCardWide : ''}`}
          >
            <Image
              src={`/${activity.img}`}
              alt=""
              fill
              priority={i < 2}
              sizes={i === 2 ? '100vw' : '(max-width: 760px) 100vw, 50vw'}
              className={styles.featuredImage}
            />
            <span className={styles.featuredScrim} />
            <span className={styles.featuredCaption}>
              <span className={styles.meta}>
                {activity.n} &nbsp;&middot;&nbsp; {activity.dur[locale]} &nbsp;&middot;&nbsp; {activity.packs[locale]}
              </span>
              <span className={styles.featuredTitle}>{activity.t[locale]}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={`${styles.groupHeader} ${styles.groupHeaderSpaced}`}>
        <span className={styles.groupLabel}>{GROUP_LABELS.anavilhanas[locale]}</span>
        <span className={styles.groupLine} />
      </div>
      <div className={styles.cardGrid}>
        {anavilhanas.map((activity, i) => {
          const index = i + 3;
          return (
            <button key={activity.n} type="button" onClick={() => onSelect(index)} className={styles.card}>
              <div className={styles.cardImageWrap}>
                <Image src={`/${activity.img}`} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.cardImage} />
              </div>
              <span className={styles.cardBody}>
                <span className={styles.cardMeta}>
                  {activity.n} &nbsp;&middot;&nbsp; {activity.dur[locale]}
                </span>
                <span className={styles.cardTitle}>{activity.t[locale]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
