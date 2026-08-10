import { describe, it, expect } from 'vitest';
import { quotePrice } from './pricing';

describe('quotePrice', () => {
  it('returns a placeholder when no season is selected yet', () => {
    const result = quotePrice({ packageIndex: 2, season: null, nights: 0, locale: 'pt' });
    expect(result).toEqual({ price: 'A definir', note: 'Selecione um período e um pacote.' });
  });

  it('flags Rio Negro as unavailable in the special season (its special price is null)', () => {
    const result = quotePrice({ packageIndex: 0, season: 'special', nights: 3, locale: 'pt' });
    expect(result.price).toBe('Sob consulta');
    expect(result.note).toContain('Rio Negro não opera em temporada especial');
  });

  it('quotes a flat price for a whole-house package (index != 3)', () => {
    const result = quotePrice({ packageIndex: 2, season: 'low', nights: 5, locale: 'pt' });
    expect(result.price).toBe('R$ 37.500');
    expect(result.note).toBe(
      'Uso exclusivo da casa, até 6 pessoas. Transfer Manaus–Novo Airão não incluso.'
    );
  });

  it('quotes per-night x nights for the Pouso package (index 3) once nights are known', () => {
    const result = quotePrice({ packageIndex: 3, season: 'low', nights: 4, locale: 'pt' });
    expect(result.price).toBe('R$ 24.000');
    expect(result.note).toBe('R$ 6.000 por diária × 4 noites, até 6 pessoas.');
  });

  it('quotes a per-night rate for the Pouso package when no nights are selected yet', () => {
    const result = quotePrice({ packageIndex: 3, season: 'low', nights: 0, locale: 'pt' });
    expect(result.price).toBe('R$ 6.000 /diária');
    expect(result.note).toBe('Valor por diária, até 6 pessoas.');
  });

  it('translates every branch to English', () => {
    const result = quotePrice({ packageIndex: 2, season: 'low', nights: 5, locale: 'en' });
    expect(result.price).toBe('R$ 37.500');
    expect(result.note).toBe(
      'Exclusive use of the house, up to 6 people. Manaus–Novo Airão transfer not included.'
    );
  });
});
