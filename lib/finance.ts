export type FinancePaymentStatus = 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';

export interface ReservationForFinance {
  id: string;
  checkIn: string; // ISO date, 'YYYY-MM-DD'
  totalValue: number;
  status: FinancePaymentStatus;
}

export interface ReceivableSummary {
  total: number;
  items: ReservationForFinance[];
}

export function calculateReceivables(reservations: ReservationForFinance[]): ReceivableSummary {
  const items = reservations.filter((r) => r.status !== 'pago');
  const total = items.reduce((sum, r) => sum + r.totalValue, 0);
  return { total, items };
}

export type Period = { type: 'month'; year: number; month: number } | { type: 'day'; date: string };

export interface ProvisioningSummary {
  total: number;
  byStatus: Record<FinancePaymentStatus, number>;
}

function isInPeriod(checkInIso: string, period: Period): boolean {
  if (period.type === 'day') return checkInIso === period.date;
  const [year, month] = checkInIso.split('-').map(Number);
  return year === period.year && month === period.month;
}

export function calculateProvisioning(
  reservations: ReservationForFinance[],
  period: Period
): ProvisioningSummary {
  const inPeriod = reservations.filter((r) => isInPeriod(r.checkIn, period));
  const byStatus: Record<FinancePaymentStatus, number> = {
    aguardando_sinal: 0,
    aguardando_pagamento: 0,
    pago: 0,
  };
  for (const r of inPeriod) byStatus[r.status] += r.totalValue;
  const total = inPeriod.reduce((sum, r) => sum + r.totalValue, 0);
  return { total, byStatus };
}
