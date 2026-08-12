import { describe, it, expect } from 'vitest';
import { isRateLimited, MAX_ATTEMPTS } from './rateLimit';

describe('isRateLimited', () => {
  const now = new Date('2026-08-11T12:00:00Z');

  it('allows login when there are fewer than MAX_ATTEMPTS recent failures', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS - 1 }, () => new Date(now.getTime() - 60_000));
    expect(isRateLimited(attempts, now)).toBe(false);
  });

  it('blocks login at MAX_ATTEMPTS recent failures', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS }, () => new Date(now.getTime() - 60_000));
    expect(isRateLimited(attempts, now)).toBe(true);
  });

  it('ignores attempts older than the 15-minute window', () => {
    const attempts = Array.from({ length: MAX_ATTEMPTS }, () => new Date(now.getTime() - 20 * 60_000));
    expect(isRateLimited(attempts, now)).toBe(false);
  });
});
