import { describe, it, expect } from 'vitest';
import { computeHeaderAppearance } from './headerAppearance';

describe('computeHeaderAppearance', () => {
  it('is transparent and dark-mode (light text) at the top of a page with a dark hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 0, heroBottom: 800 });
    expect(appearance).toEqual({
      solid: false,
      dark: true,
      background: 'transparent',
      backdropFilter: 'none',
      boxShadow: 'none',
      ink: '#FBF9F5',
    });
  });

  it('turns solid and switches to dark ink once scrolled past the hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 300, heroBottom: 50 });
    expect(appearance).toEqual({
      solid: true,
      dark: false,
      background: 'rgba(251,249,245,.92)',
      backdropFilter: 'blur(14px) saturate(1.1)',
      boxShadow: '0 1px 0 rgba(42,28,18,.09)',
      ink: '#2A1C12',
    });
  });

  it('treats a page with no dark hero (e.g. Tarifas) as light-mode even at scrollY 0', () => {
    const appearance = computeHeaderAppearance({ scrollY: 0, heroBottom: null });
    expect(appearance.dark).toBe(false);
    expect(appearance.solid).toBe(false);
    expect(appearance.background).toBe('transparent');
  });

  it('goes solid past the 40px scroll threshold on a page without a dark hero', () => {
    const appearance = computeHeaderAppearance({ scrollY: 41, heroBottom: null });
    expect(appearance.solid).toBe(true);
    expect(appearance.dark).toBe(false);
    expect(appearance.boxShadow).toBe('0 1px 0 rgba(42,28,18,.09)');
  });

  it('uses the 120px hero-bottom threshold, not 0', () => {
    expect(computeHeaderAppearance({ scrollY: 0, heroBottom: 121 }).dark).toBe(true);
    expect(computeHeaderAppearance({ scrollY: 0, heroBottom: 120 }).dark).toBe(false);
  });
});
