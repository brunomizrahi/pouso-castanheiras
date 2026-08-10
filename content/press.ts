import type { Locale } from '@/lib/types';

export interface PressQuote {
  quote: Record<Locale, string>;
  source: string;
}

export const PRESS_QUOTES: PressQuote[] = [
  {
    quote: {
      pt: '“É viver a maior floresta tropical do mundo fora da comodidade de um quarto de hotel.”',
      en: '“It is living the largest tropical forest in the world, outside the comfort of a hotel room.”',
    },
    source: 'Now Boarding',
  },
  {
    quote: {
      pt: '“Uma verdadeira viagem sensorial através de sua gastronomia.”',
      en: '“A truly sensory journey through its cooking.”',
    },
    source: 'Revista Hotéis',
  },
  {
    quote: {
      pt: '“Tudo isso com muito conforto, segurança e completa imersão na floresta e na cultura local.”',
      en: '“All of it with great comfort, safety and full immersion in the forest and the local culture.”',
    },
    source: 'PANROTAS · Hotel Inspectors',
  },
  {
    quote: {
      pt: '“Hospedagem embrenhada no meio da mata com proposta de imersão na Amazônia.”',
      en: '“A stay tucked deep in the forest, built around immersion in the Amazon.”',
    },
    source: 'CNN Brasil',
  },
  {
    quote: {
      pt: '“A porta de entrada para uma imersão autêntica na Amazônia.”',
      en: '“The gateway to an authentic immersion in the Amazon.”',
    },
    source: 'Paes pelo Mundo',
  },
];
