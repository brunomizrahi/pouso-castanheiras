import { describe, it, expect } from 'vitest';
import { season } from './season';

describe('season', () => {
  it('returns "low" for a plain date outside any special window', () => {
    expect(season('2026-04-15')).toBe('low');
  });

  it('returns "low" for early/mid December, before the Réveillon window opens', () => {
    expect(season('2026-12-26')).toBe('low');
  });

  it('returns "special" for Réveillon, Dec 27 onward', () => {
    expect(season('2025-12-27')).toBe('special');
    expect(season('2025-12-31')).toBe('special');
  });

  it('returns "special" for Réveillon, up to Jan 5', () => {
    expect(season('2026-01-01')).toBe('special');
    expect(season('2026-01-05')).toBe('special');
  });

  it('returns "high" for January outside the Réveillon window', () => {
    expect(season('2026-01-10')).toBe('high');
  });

  it('returns "low" for early February, before Carnaval opens', () => {
    expect(season('2026-02-12')).toBe('low');
  });

  it('returns "special" for Carnaval, Feb 13 onward', () => {
    expect(season('2026-02-13')).toBe('special');
  });

  it('returns "special" through March 18', () => {
    expect(season('2026-03-18')).toBe('special');
  });

  it('returns "low" from March 19 onward', () => {
    expect(season('2026-03-19')).toBe('low');
  });

  it('returns "high" for July', () => {
    expect(season('2026-07-15')).toBe('high');
  });
});
