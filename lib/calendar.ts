import { iso } from './format';
import type { Locale } from './types';

export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

export function pickDay(range: DateRange, isoStr: string): DateRange {
  const { checkIn, checkOut } = range;
  if (!checkIn || (checkIn && checkOut)) return { checkIn: isoStr, checkOut: null };
  if (isoStr === checkIn) return { checkIn: null, checkOut: null };
  if (isoStr < checkIn) return { checkIn: isoStr, checkOut: checkIn };
  return { checkIn, checkOut: isoStr };
}

export type CalendarDayState = 'empty' | 'past' | 'selected' | 'inside' | 'available';

export interface CalendarDay {
  day: string;
  iso: string | null;
  state: CalendarDayState;
}

export interface CalendarMonth {
  label: string;
  days: CalendarDay[];
}

const MONTH_LABELS: Record<Locale, string[]> = {
  pt: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

export function buildMonth(
  base: Date,
  range: DateRange,
  locale: Locale,
  today: Date = new Date()
): CalendarMonth {
  const y = base.getFullYear();
  const m = base.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const cutoff = new Date(today);
  cutoff.setHours(0, 0, 0, 0);
  const { checkIn, checkOut } = range;

  const days: CalendarDay[] = [];
  for (let i = 0; i < startDow; i++) {
    days.push({ day: '', iso: null, state: 'empty' });
  }
  for (let d = 1; d <= daysIn; d++) {
    const dt = new Date(y, m, d);
    const s = iso(dt);
    const past = dt < cutoff;
    const isSelected = s === checkIn || s === checkOut;
    const inside = !!(checkIn && checkOut && s > checkIn && s < checkOut);
    let state: CalendarDayState = 'available';
    if (past) state = 'past';
    else if (isSelected) state = 'selected';
    else if (inside) state = 'inside';
    days.push({ day: String(d), iso: s, state });
  }

  return { label: MONTH_LABELS[locale][m] + ' ' + y, days };
}
