'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import { ROTEIROS } from '@/content/roteiros';
import styles from './RoteiroView.module.css';

// dc.html 1140-1164 (markup) + 2042-2047 ([data-rot] active-state styling): pill tabs for the
// three itineraries that have one (Rio Negro, Macucus, Ajuricaba — Pouso has no day-by-day
// itinerary), each showing ROTEIROS[selected] as a list of 90px/1fr day rows. The selected
// itinerary is local UI state, not lifted to the page — nothing else on the page depends on it.
const TABS = [
  { pt: 'Rio Negro · 3 noites', en: 'Rio Negro · 3 nights' },
  { pt: 'Macucus · 4 noites', en: 'Macucus · 4 nights' },
  { pt: 'Ajuricaba · 5 noites', en: 'Ajuricaba · 5 nights' },
] as const satisfies Record<Locale, string>[];

const FOOTNOTE = {
  pt: 'Este é um roteiro sugerido. A ordem se define no dia, junto ao caseiro e aos guias, conforme o clima, o nível do rio e o ritmo do grupo.',
  en: "This is a suggested itinerary. The order is decided on the day, together with the caretaker and guides, according to the weather, the river level and the group's pace.",
} as const satisfies Record<Locale, string>;

export function RoteiroView() {
  const locale = useLocale() as Locale;
  const [selected, setSelected] = useState(0);
  const days = ROTEIROS[selected];

  return (
    <section className={styles.section}>
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab.en}
            type="button"
            onClick={() => setSelected(i)}
            className={`${styles.tab} ${i === selected ? styles.tabActive : ''}`}
          >
            {tab[locale]}
          </button>
        ))}
      </div>

      {days.map((day) => (
        <article key={day.n} className={styles.day}>
          <div>
            <div className={styles.dayNumber}>{day.n}</div>
            <div className={styles.dayLabel}>{day.label[locale]}</div>
          </div>
          <div className={styles.dayContent}>
            <div>
              <h3 className={styles.dayTitle}>{day.title[locale]}</h3>
              <p className={styles.dayBody}>{day.body[locale]}</p>
            </div>
            <div className={styles.dayImageWrap}>
              <Image src={`/${day.img}`} alt="" fill sizes="(max-width: 760px) 100vw, 40vw" className={styles.dayImage} />
            </div>
          </div>
        </article>
      ))}

      <p className={styles.footnote}>{FOOTNOTE[locale]}</p>
    </section>
  );
}
