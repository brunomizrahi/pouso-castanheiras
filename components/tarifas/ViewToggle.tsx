'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import styles from './ViewToggle.module.css';

export type TarifasView = 'tabela' | 'cards' | 'roteiro';

// dc.html 964-970 (markup) + 2024-2029 (the [data-view] active-state styling applied by
// paintHeader): sticky pill bar, active button gets an ink background/border, inactive
// buttons stay white with a sand border.
const LABELS = {
  tabela: { pt: 'Comparar', en: 'Compare' },
  cards: { pt: 'Pacotes', en: 'Packages' },
  roteiro: { pt: 'Roteiro dia a dia', en: 'Day by day' },
} as const satisfies Record<TarifasView, Record<Locale, string>>;

const VIEWS: TarifasView[] = ['tabela', 'cards', 'roteiro'];

interface ViewToggleProps {
  view: TarifasView;
  onChange: (view: TarifasView) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.row}>
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`${styles.button} ${v === view ? styles.buttonActive : ''}`}
          >
            {LABELS[v][locale]}
          </button>
        ))}
      </div>
    </section>
  );
}
