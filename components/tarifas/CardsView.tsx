'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import { PACKAGES, PRICES } from '@/content/packages';
import { brl } from '@/lib/format';
import styles from './CardsView.module.css';

// dc.html 1086-1138: a 12-col mosaic — Rio Negro (span 7), Macucus and Ajuricaba (span 5
// each, Ajuricaba badged "Sugerido"), and Pouso (span 7, a bordered text card instead of a
// photo). All four buttons open the same package modal (dc.html onClick="{{ pkg0..3 }}").
// Nights-per-package and activity counts aren't stored as discrete fields on PackageContent,
// so nights is a small local lookup and activity counts are derived from `acts.length`.
// Note: dc.html's Pouso card (line 1128) carries its own short inline paragraph distinct from
// the longer PACKAGES[3].body used in the modal (dc.html PKGS[3].body, lines 1743-1754) — we
// reuse PACKAGES[3].body here too, following the same precedent as ActivityGrid's "Piracaia"
// card, rather than introducing a second untracked copy of the same content.
const NIGHTS = [3, 4, 5];

const LABELS = {
  packageWord: { pt: 'Pacote', en: 'Package' },
  nightsWord: { pt: 'noites', en: 'nights' },
  activitiesWord: { pt: 'atividades', en: 'activities' },
  from: { pt: 'a partir de ', en: 'from ' },
  upTo6: { pt: 'até 6 pessoas', en: 'up to 6 people' },
  suggested: { pt: 'Sugerido', en: 'Suggested' },
  perNightMeta: { pt: 'Diária', en: 'Per night' },
  onProperty: { pt: 'na propriedade', en: 'on the property' },
  perNightNote: { pt: 'por diária · mínimo de 2 noites', en: 'per night · minimum 2 nights' },
  footnote: {
    pt: 'Toque em um pacote para ver as atividades inclusas e os valores de cada temporada.',
    en: 'Tap a package to see the activities included and the rates for each season.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

interface CardsViewProps {
  onSelect: (index: number) => void;
}

export function CardsView({ onSelect }: CardsViewProps) {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {PACKAGES.slice(0, 3).map((pkg, i) => (
          <button
            key={pkg.name.en}
            type="button"
            onClick={() => onSelect(i)}
            className={`${styles.photoCard} ${i !== 0 ? styles.photoCardNarrow : ''}`}
          >
            <Image
              src={`/${pkg.img}`}
              alt=""
              fill
              sizes={i === 0 ? '(max-width: 900px) 100vw, 58vw' : '(max-width: 900px) 100vw, 40vw'}
              className={styles.photoCardImage}
            />
            <span className={styles.scrim} />
            {i === 2 && <span className={styles.badge}>{LABELS.suggested[locale]}</span>}
            <span className={styles.caption}>
              <span className={styles.meta}>
                {LABELS.packageWord[locale]} &nbsp;&middot;&nbsp; {NIGHTS[i]} {LABELS.nightsWord[locale]} &nbsp;&middot;&nbsp;{' '}
                {pkg.acts.length} {LABELS.activitiesWord[locale]}
              </span>
              <span className={styles.name}>{pkg.name[locale]}</span>
              <span className={styles.priceRow}>
                <span className={styles.price}>
                  {LABELS.from[locale]}
                  {brl(PRICES[i].low)}
                </span>
                {i === 0 && <span className={styles.peopleNote}>{LABELS.upTo6[locale]}</span>}
              </span>
            </span>
          </button>
        ))}

        <button type="button" onClick={() => onSelect(3)} className={styles.pousoCard}>
          <span>
            <span className={styles.pousoMeta}>
              {LABELS.perNightMeta[locale]} &nbsp;&middot;&nbsp; {PACKAGES[3].acts.length} {LABELS.activitiesWord[locale]}{' '}
              {LABELS.onProperty[locale]}
            </span>
            <span className={styles.pousoName}>{PACKAGES[3].name[locale]}</span>
            <span className={styles.pousoBody}>{PACKAGES[3].body[locale]}</span>
          </span>
          <span className={styles.pousoFooter}>
            <span className={styles.pousoPrice}>
              {LABELS.from[locale]}
              {brl(PRICES[3].low)}
            </span>
            <span className={styles.pousoNote}>{LABELS.perNightNote[locale]}</span>
          </span>
        </button>
      </div>
      <p className={styles.footnote}>{LABELS.footnote[locale]}</p>
    </section>
  );
}
