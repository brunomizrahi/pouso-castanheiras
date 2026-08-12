import { describe, it, expect } from 'vitest';
import { calculateReceivables, calculateProvisioning, type ReservationForFinance } from './finance';

const sample: ReservationForFinance[] = [
  { id: '1', checkIn: '2026-09-10', totalValue: 21400, status: 'pago' },
  { id: '2', checkIn: '2026-09-15', totalValue: 37500, status: 'aguardando_sinal' },
  { id: '3', checkIn: '2026-10-02', totalValue: 29000, status: 'aguardando_pagamento' },
];

describe('calculateReceivables', () => {
  it('sums only reservations that are not fully paid', () => {
    const result = calculateReceivables(sample);
    expect(result.total).toBe(37500 + 29000);
    expect(result.items).toHaveLength(2);
  });

  it('returns zero for an empty list', () => {
    expect(calculateReceivables([])).toEqual({ total: 0, items: [] });
  });
});

describe('calculateProvisioning', () => {
  it('sums reservations whose check-in falls in the given month, split by status', () => {
    const result = calculateProvisioning(sample, { type: 'month', year: 2026, month: 9 });
    expect(result.total).toBe(21400 + 37500);
    expect(result.byStatus.pago).toBe(21400);
    expect(result.byStatus.aguardando_sinal).toBe(37500);
    expect(result.byStatus.aguardando_pagamento).toBe(0);
  });

  it('excludes reservations outside the given month', () => {
    const result = calculateProvisioning(sample, { type: 'month', year: 2026, month: 10 });
    expect(result.total).toBe(29000);
  });

  it('sums reservations for one specific day', () => {
    const result = calculateProvisioning(sample, { type: 'day', date: '2026-09-10' });
    expect(result.total).toBe(21400);
  });

  it('returns zero when nothing matches the period', () => {
    const result = calculateProvisioning(sample, { type: 'day', date: '2026-12-25' });
    expect(result.total).toBe(0);
  });
});
