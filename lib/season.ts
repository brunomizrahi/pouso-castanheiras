import { fromIso } from './format';
import type { Locale } from './types';

export type Season = 'low' | 'high' | 'special';

export function season(isoStr: string): Season {
  const d = fromIso(isoStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 12 && day >= 27) || (m === 1 && day <= 5)) return 'special';
  if (m === 2 && day >= 13) return 'special';
  if (m === 3 && day <= 18) return 'special';
  if (m === 1 || m === 7) return 'high';
  return 'low';
}

export const SEASON_LABEL: Record<Season, Record<Locale, string>> = {
  low: { pt: 'Baixa temporada', en: 'Low season' },
  high: { pt: 'Alta temporada', en: 'High season' },
  special: { pt: 'Temporada especial', en: 'Special season' },
};
