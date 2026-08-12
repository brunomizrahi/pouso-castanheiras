import { describe, it, expect } from 'vitest';
import { buildPanelMonth, type PanelReservation } from './panelCalendar';

const reservations: PanelReservation[] = [
  { id: 'a', checkIn: '2026-09-10', checkOut: '2026-09-13', status: 'pago' },
  { id: 'b', checkIn: '2026-09-20', checkOut: '2026-09-22', status: 'aguardando_sinal' },
];

describe('buildPanelMonth', () => {
  it('labels the month and pads leading empty cells for the weekday offset', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations); // September 2026
    expect(month.label).toBe('Setembro 2026');
    // Sept 1 2026 is a Tuesday: 2 empty cells before day 1, then 30 days.
    expect(month.days).toHaveLength(2 + 30);
  });

  it('assigns the covering reservation to each day inside its range', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const day11 = month.days.find((d) => d.iso === '2026-09-11');
    expect(day11?.reservation?.id).toBe('a');
    expect(day11?.reservation?.status).toBe('pago');
  });

  it('leaves days with no covering reservation as available', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const day16 = month.days.find((d) => d.iso === '2026-09-16');
    expect(day16?.reservation).toBeNull();
  });

  it('treats check-out day as not covered (guest has left)', () => {
    const month = buildPanelMonth(new Date(2026, 8, 1), reservations);
    const checkoutDay = month.days.find((d) => d.iso === '2026-09-13');
    expect(checkoutDay?.reservation).toBeNull();
  });
});
