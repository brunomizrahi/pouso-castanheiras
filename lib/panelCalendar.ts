export type PanelPaymentStatus = 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';

export interface PanelReservation {
  id: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  status: PanelPaymentStatus;
}

export interface PanelCalendarDay {
  day: string;
  iso: string | null;
  reservation: PanelReservation | null;
}

export interface PanelCalendarMonth {
  label: string;
  days: PanelCalendarDay[];
}

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function iso(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function buildPanelMonth(base: Date, reservations: PanelReservation[]): PanelCalendarMonth {
  const y = base.getFullYear();
  const m = base.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();

  const days: PanelCalendarDay[] = [];
  for (let i = 0; i < startDow; i++) {
    days.push({ day: '', iso: null, reservation: null });
  }
  for (let d = 1; d <= daysIn; d++) {
    const s = iso(new Date(y, m, d));
    const covering = reservations.find((r) => s >= r.checkIn && s < r.checkOut) ?? null;
    days.push({ day: String(d), iso: s, reservation: covering });
  }

  return { label: MONTH_LABELS[m] + ' ' + y, days };
}
