'use client';

import { useLocale } from 'next-intl';
import type { CalendarDayState, CalendarMonth } from '@/lib/calendar';
import type { Locale } from '@/lib/types';
import styles from './Calendar.module.css';

// dc.html 1248-1281: bordered card, "01 · Período" label + prev/next month buttons, two
// months side by side (buildMonth already computes label/day states — this component only
// maps CalendarDayState to the day.bg/fg/r styling from dc.html's buildMonth, lines 1862-1865),
// and a legend for the two swatches (check-in/out pill, nights-selected block).
const LABELS = {
  step: { pt: '01 · Período', en: '01 · Dates' },
  prevMonth: { pt: 'Mês anterior', en: 'Previous month' },
  nextMonth: { pt: 'Próximo mês', en: 'Next month' },
  legendInOut: { pt: 'Check-in / check-out', en: 'Check-in / check-out' },
  legendNights: { pt: 'Noites selecionadas', en: 'Nights selected' },
} as const satisfies Record<string, Record<Locale, string>>;

const WEEKDAYS: Record<Locale, string[]> = {
  pt: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

const STATE_CLASS: Record<CalendarDayState, string> = {
  empty: 'dayEmpty',
  past: 'dayPast',
  selected: 'daySelected',
  inside: 'dayInside',
  available: 'dayAvailable',
};

interface CalendarProps {
  months: CalendarMonth[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickDay: (isoStr: string) => void;
}

export function Calendar({ months, onPrevMonth, onNextMonth, onPickDay }: CalendarProps) {
  const locale = useLocale() as Locale;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.stepLabel}>{LABELS.step[locale]}</div>
        <div className={styles.nav}>
          <button type="button" onClick={onPrevMonth} className={styles.navButton} aria-label={LABELS.prevMonth[locale]}>
            &lsaquo;
          </button>
          <button type="button" onClick={onNextMonth} className={styles.navButton} aria-label={LABELS.nextMonth[locale]}>
            &rsaquo;
          </button>
        </div>
      </div>
      <div className={styles.months}>
        {months.map((m, mi) => (
          <div key={mi}>
            <div className={styles.monthLabel}>{m.label}</div>
            <div className={styles.weekdays}>
              {WEEKDAYS[locale].map((w, i) => (
                <span key={i} className={styles.weekday}>
                  {w}
                </span>
              ))}
            </div>
            <div className={styles.days}>
              {m.days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={d.state === 'past' || d.state === 'empty'}
                  onClick={() => d.iso && onPickDay(d.iso)}
                  className={`${styles.day} ${styles[STATE_CLASS[d.state]]}`}
                >
                  {d.day}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotInOut}`} />
          {LABELS.legendInOut[locale]}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotNights}`} />
          {LABELS.legendNights[locale]}
        </span>
      </div>
    </div>
  );
}
