export interface HeaderAppearanceInput {
  scrollY: number;
  /**
   * Distance in px from the viewport top to the bottom of the page's
   * `[data-dark-hero]` element, or null if the current page has no dark hero
   * (e.g. Tarifas, Mídia).
   */
  heroBottom: number | null;
}

export interface HeaderAppearance {
  solid: boolean;
  dark: boolean;
  background: string;
  backdropFilter: string;
  boxShadow: string;
  ink: string;
}

export function computeHeaderAppearance({ scrollY, heroBottom }: HeaderAppearanceInput): HeaderAppearance {
  const dark = heroBottom !== null && heroBottom > 120;
  const solid = scrollY > 40;
  return {
    solid,
    dark,
    background: solid ? (dark ? 'rgba(26,22,17,.55)' : 'rgba(251,249,245,.92)') : 'transparent',
    backdropFilter: solid ? 'blur(14px) saturate(1.1)' : 'none',
    boxShadow: solid && !dark ? '0 1px 0 rgba(42,28,18,.09)' : 'none',
    ink: dark ? '#FBF9F5' : '#2A1C12',
  };
}
