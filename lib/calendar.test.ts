import { describe, it, expect } from 'vitest';
import { pickDay, buildMonth } from './calendar';

describe('pickDay', () => {
  it('sets check-in when nothing is selected yet', () => {
    expect(pickDay({ checkIn: null, checkOut: null }, '2026-08-10')).toEqual({
      checkIn: '2026-08-10',
      checkOut: null,
    });
  });

  it('clears the range when clicking the check-in day again', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-10')).toEqual({
      checkIn: null,
      checkOut: null,
    });
  });

  it('sets check-out when clicking a later day than check-in', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-15')).toEqual({
      checkIn: '2026-08-10',
      checkOut: '2026-08-15',
    });
  });

  it('reorders the range when clicking an earlier day than check-in', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: null }, '2026-08-05')).toEqual({
      checkIn: '2026-08-05',
      checkOut: '2026-08-10',
    });
  });

  it('starts a new range when a complete range is already selected', () => {
    expect(pickDay({ checkIn: '2026-08-10', checkOut: '2026-08-15' }, '2026-09-01')).toEqual({
      checkIn: '2026-09-01',
      checkOut: null,
    });
  });
});

describe('buildMonth', () => {
  const today = new Date(2026, 0, 15); // Jan 15 2026

  it('labels the month in Portuguese and pads leading empty cells for the weekday offset', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    expect(month.label).toBe('Janeiro 2026');
    // Jan 1 2026 is a Thursday: 4 empty cells before day 1, then 31 days.
    expect(month.days).toHaveLength(4 + 31);
    expect(month.days.slice(0, 4)).toEqual([
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
      { day: '', iso: null, state: 'empty' },
    ]);
  });

  it('marks days before today as past and disables selection', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    const day10 = month.days[4 + 9]; // index of day "10"
    expect(day10).toEqual({ day: '10', iso: '2026-01-10', state: 'past' });
  });

  it('marks today and future days as available when no range is selected', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'pt', today);
    const day15 = month.days[4 + 14];
    const day20 = month.days[4 + 19];
    expect(day15).toEqual({ day: '15', iso: '2026-01-15', state: 'available' });
    expect(day20).toEqual({ day: '20', iso: '2026-01-20', state: 'available' });
  });

  it('marks check-in/check-out days as selected and days between them as inside the range', () => {
    const range = { checkIn: '2026-01-20', checkOut: '2026-01-25' };
    const month = buildMonth(new Date(2026, 0, 1), range, 'pt', today);
    expect(month.days[4 + 19]).toEqual({ day: '20', iso: '2026-01-20', state: 'selected' });
    expect(month.days[4 + 21]).toEqual({ day: '22', iso: '2026-01-22', state: 'inside' });
    expect(month.days[4 + 24]).toEqual({ day: '25', iso: '2026-01-25', state: 'selected' });
    expect(month.days[4 + 25]).toEqual({ day: '26', iso: '2026-01-26', state: 'available' });
  });

  it('labels the month in English', () => {
    const month = buildMonth(new Date(2026, 0, 1), { checkIn: null, checkOut: null }, 'en', today);
    expect(month.label).toBe('January 2026');
  });
});
