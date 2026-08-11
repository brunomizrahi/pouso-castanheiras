import { brl } from './format';
import { PRICES } from '@/content/packages';
import type { Season } from './season';
import type { Locale } from './types';

export interface PriceQuote {
  price: string;
  note: string;
}

export function quotePrice(params: {
  packageIndex: number | null;
  season: Season | null;
  nights: number;
  locale: Locale;
}): PriceQuote {
  const { packageIndex, season, nights, locale } = params;
  const EN = locale === 'en';
  const L = (pt: string, en: string) => (EN ? en : pt);

  if (!season || packageIndex === null) {
    return {
      price: L('A definir', 'To be defined'),
      note: L('Selecione um período e um pacote.', 'Select a date range and a package.'),
    };
  }

  const pr = PRICES[packageIndex];
  const v = pr[season];

  if (v === null) {
    return {
      price: L('Sob consulta', 'On request'),
      note: L(
        'O pacote Rio Negro não opera em temporada especial. Considere Macucus ou Ajuricaba.',
        'The Rio Negro package does not run in the special season. Consider Macucus or Ajuricaba.'
      ),
    };
  }

  if (packageIndex === 3) {
    const price = nights ? brl(v * nights) : brl(v) + L(' /diária', ' /night');
    const note = nights
      ? brl(v) +
        L(' por diária × ', ' per night × ') +
        nights +
        L(' noites, até 6 pessoas.', ' nights, up to 6 people.')
      : L('Valor por diária, até 6 pessoas.', 'Rate per night, up to 6 people.');
    return { price, note };
  }

  return {
    price: brl(v),
    note: L(
      'Uso exclusivo da casa, até 6 pessoas. Transfer Manaus–Novo Airão não incluso.',
      'Exclusive use of the house, up to 6 people. Manaus–Novo Airão transfer not included.'
    ),
  };
}
