'use client';

import { useLocale } from 'next-intl';
import { TRANSFER_LABELS, TRANSFER_ORDER, type TransferKey } from '@/content/transfers';
import type { Locale } from '@/lib/types';
import styles from './TransferStep.module.css';

// dc.html 1305-1328 (markup) + 2030-2035 (selected-state paint, same treatment as the package
// step). dc.html splits each option into a title line and a separate price-meta line, but
// content/transfers.ts only carries the combined label ("Táxi da cooperativa (R$ 1.100 ida e
// volta)") used for the summary row and the WhatsApp message — so each option renders that
// single string rather than inventing an untracked second copy of the title/price split.
const LABEL = { pt: '03 · Transfer', en: '03 · Transfer' } as const satisfies Record<Locale, string>;
const NOTE = {
  pt: 'Opcional. Nós organizamos tudo.',
  en: 'Optional. We arrange everything.',
} as const satisfies Record<Locale, string>;

interface TransferStepProps {
  selected: TransferKey;
  onSelect: (key: TransferKey) => void;
}

export function TransferStep({ selected, onSelect }: TransferStepProps) {
  const locale = useLocale() as Locale;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{LABEL[locale]}</span>
        <span className={styles.note}>{NOTE[locale]}</span>
      </div>
      <div className={styles.grid}>
        {TRANSFER_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`${styles.option} ${key === selected ? styles.optionSelected : ''}`}
          >
            <span className={styles.name}>{TRANSFER_LABELS[key][locale]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
