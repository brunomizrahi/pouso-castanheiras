import { describe, it, expect } from 'vitest';
import { brl, iso, fromIso, fmtBr } from './format';

describe('brl', () => {
  it('formats an integer as Brazilian currency with a thousands separator and no decimals', () => {
    expect(brl(37500)).toBe('R$ 37.500');
  });

  it('formats small numbers without a thousands separator', () => {
    expect(brl(500)).toBe('R$ 500');
  });
});

describe('iso', () => {
  it('formats a Date as YYYY-MM-DD, zero-padded', () => {
    expect(iso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('fromIso', () => {
  it('parses an ISO date string into a local Date at midnight', () => {
    const d = fromIso('2026-01-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
  });
});

describe('fmtBr', () => {
  it('formats an ISO date string as DD/MM/YYYY', () => {
    expect(fmtBr('2026-01-05')).toBe('05/01/2026');
  });
});
