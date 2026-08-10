import { fmtBr } from './format';
import { SEASON_LABEL, type Season } from './season';
import { TRANSFER_LABELS, type TransferKey } from '@/content/transfers';
import type { Locale } from './types';

const WHATSAPP_NUMBER = '5511942995588';

function stripPackageMeta(meta: string): string {
  return meta
    .replace('Pacote · ', '')
    .replace('Package · ', '')
    .replace(' · sugerido', '')
    .replace(' · suggested', '');
}

export interface WhatsAppMessageParams {
  locale: Locale;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  packageName: string;
  packageMeta: string;
  season: Season | null;
  price: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  pax: string;
  transfer: TransferKey;
  notes: string;
}

export function buildWhatsAppMessage(p: WhatsAppMessageParams): string {
  const EN = p.locale === 'en';
  const L = (pt: string, en: string) => (EN ? en : pt);
  const definedPlaceholder = L('A definir', 'To be defined');

  const lines: string[] = [
    L(
      'Olá! Gostaria de consultar disponibilidade no Pouso das Castanheiras.',
      'Hello! I would like to check availability at Pouso das Castanheiras.'
    ),
    '',
  ];

  lines.push(
    L('Período: ', 'Dates: ') +
      (p.checkIn && p.checkOut
        ? fmtBr(p.checkIn) +
          L(' a ', ' to ') +
          fmtBr(p.checkOut) +
          ' (' +
          p.nights +
          (p.nights === 1 ? L(' noite)', ' night)') : L(' noites)', ' nights)'))
        : p.checkIn
        ? L('a partir de ', 'from ') + fmtBr(p.checkIn)
        : L('a definir', 'to be defined'))
  );

  lines.push(L('Pacote: ', 'Package: ') + p.packageName + ', ' + stripPackageMeta(p.packageMeta));

  if (p.season) {
    lines.push(
      L('Temporada: ', 'Season: ') +
        SEASON_LABEL[p.season][p.locale] +
        (p.price !== definedPlaceholder ? ', ' + p.price : '')
    );
  }

  lines.push(L('Hóspedes: ', 'Guests: ') + p.pax);
  lines.push('Transfer: ' + TRANSFER_LABELS[p.transfer][p.locale]);
  lines.push('');
  lines.push(L('Nome: ', 'Name: ') + (p.guestName || L('a informar', 'to be provided')));
  lines.push('E-mail: ' + (p.guestEmail || L('a informar', 'to be provided')));
  lines.push(L('Telefone: ', 'Phone: ') + (p.guestPhone || L('a informar', 'to be provided')));

  if (p.notes) {
    lines.push('');
    lines.push(L('Observações: ', 'Notes: ') + p.notes);
  }

  return lines.join('\n');
}

export function buildWhatsAppLink(message: string): string {
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
}
