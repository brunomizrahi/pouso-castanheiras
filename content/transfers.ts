import type { Locale } from '@/lib/types';

export type TransferKey = 'taxi' | 'van' | 'hidro' | 'depois';

export const TRANSFER_LABELS: Record<TransferKey, Record<Locale, string>> = {
  taxi: {
    pt: 'Táxi da cooperativa (R$ 1.100 ida e volta)',
    en: 'Cooperative taxi (R$ 1,100 round trip)',
  },
  van: {
    pt: 'Van executiva (R$ 1.300 cada trecho)',
    en: 'Executive van (R$ 1,300 each way)',
  },
  hidro: {
    pt: 'Hidroavião (R$ 11.000 cada trecho)',
    en: 'Seaplane (R$ 11,000 each way)',
  },
  depois: {
    pt: 'A definir com o Pouso',
    en: 'To be arranged with the Pouso',
  },
};

export const TRANSFER_ORDER: TransferKey[] = ['taxi', 'van', 'hidro', 'depois'];
