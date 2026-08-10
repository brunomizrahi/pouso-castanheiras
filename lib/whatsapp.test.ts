import { describe, it, expect } from 'vitest';
import { buildWhatsAppMessage, buildWhatsAppLink } from './whatsapp';

describe('buildWhatsAppMessage', () => {
  it('composes the full PT message with dates, package, season, price, guest and transfer', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: '2026-08-10',
      checkOut: '2026-08-13',
      nights: 3,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: 'low',
      price: 'R$ 37.500',
      guestName: 'Ana Souza',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '4',
      transfer: 'van',
      notes: '',
    });

    expect(message).toBe(
      [
        'Olá! Gostaria de consultar disponibilidade no Pouso das Castanheiras.',
        '',
        'Período: 10/08/2026 a 13/08/2026 (3 noites)',
        'Pacote: Ajuricaba, 5 noites',
        'Temporada: Baixa temporada, R$ 37.500',
        'Hóspedes: 4',
        'Transfer: Van executiva (R$ 1.300 cada trecho)',
        '',
        'Nome: Ana Souza',
        'E-mail: ana@example.com',
        'Telefone: 11999999999',
      ].join('\n')
    );
  });

  it('falls back to "a informar" for missing guest fields and omits the notes block when empty', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: null,
      checkOut: null,
      nights: 0,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: null,
      price: 'A definir',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      pax: '4',
      transfer: 'depois',
      notes: '',
    });

    expect(message).toContain('Período: a definir');
    expect(message).toContain('Nome: a informar');
    expect(message).toContain('E-mail: a informar');
    expect(message).toContain('Telefone: a informar');
    expect(message).not.toContain('Temporada:');
  });

  it('appends an "Observações" block when notes are present', () => {
    const message = buildWhatsAppMessage({
      locale: 'pt',
      checkIn: null,
      checkOut: null,
      nights: 0,
      packageName: 'Ajuricaba',
      packageMeta: 'Pacote · 5 noites · sugerido',
      season: null,
      price: 'A definir',
      guestName: 'Ana',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '2',
      transfer: 'depois',
      notes: 'Viajamos com um bebê de colo.',
    });

    expect(message.endsWith('Observações: Viajamos com um bebê de colo.')).toBe(true);
  });

  it('translates the whole message to English', () => {
    const message = buildWhatsAppMessage({
      locale: 'en',
      checkIn: '2026-08-10',
      checkOut: '2026-08-11',
      nights: 1,
      packageName: 'Ajuricaba',
      packageMeta: 'Package · 5 nights · suggested',
      season: 'low',
      price: 'R$ 6.000',
      guestName: 'Ana Souza',
      guestEmail: 'ana@example.com',
      guestPhone: '11999999999',
      pax: '2',
      transfer: 'taxi',
      notes: '',
    });

    expect(message).toContain('Hello! I would like to check availability at Pouso das Castanheiras.');
    expect(message).toContain('Dates: 10/08/2026 to 11/08/2026 (1 night)');
    expect(message).toContain('Package: Ajuricaba, 5 nights');
    expect(message).toContain('Guests: 2');
    expect(message).toContain('Transfer: Cooperative taxi (R$ 1,100 round trip)');
  });
});

describe('buildWhatsAppLink', () => {
  it('builds a wa.me URL to the pousada number with the URL-encoded message', () => {
    const link = buildWhatsAppLink('Olá!\nTeste');
    expect(link).toBe('https://wa.me/5511942995588?text=Ol%C3%A1!%0ATeste');
  });
});
