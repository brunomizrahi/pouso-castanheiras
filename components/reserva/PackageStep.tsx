'use client';

import { useLocale } from 'next-intl';
import { PACKAGES } from '@/content/packages';
import type { Locale } from '@/lib/types';
import styles from './PackageStep.module.css';

// dc.html 1283-1303 (markup) + 2036-2041 (selected-state paint: border-color and background
// turn ink/bg-alt with an inset ink box-shadow when `data-pk` matches `pkgSel`). The card's
// short nights caption ("3 noites" / "por diária") isn't a discrete field on PackageContent —
// same precedent as CardsView's local NIGHTS lookup — so it's kept as a small local array here.
const LABEL = { pt: '02 · Tipo de tarifa', en: '02 · Rate type' } as const satisfies Record<Locale, string>;

const NIGHTS_META: Record<Locale, string>[] = [
  { pt: '3 noites', en: '3 nights' },
  { pt: '4 noites', en: '4 nights' },
  { pt: '5 noites', en: '5 nights' },
  { pt: 'por diária', en: 'per night' },
];

interface PackageStepProps {
  selected: number | null;
  onSelect: (index: number) => void;
}

export function PackageStep({ selected, onSelect }: PackageStepProps) {
  const locale = useLocale() as Locale;

  return (
    <div className={styles.card}>
      <div className={styles.label}>{LABEL[locale]}</div>
      <div className={styles.grid}>
        {PACKAGES.map((pkg, i) => (
          <button
            key={pkg.name.en}
            type="button"
            onClick={() => onSelect(i)}
            className={`${styles.option} ${i === selected ? styles.optionSelected : ''}`}
          >
            <span className={styles.name}>{pkg.name[locale]}</span>
            <span className={styles.meta}>{NIGHTS_META[i][locale]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
