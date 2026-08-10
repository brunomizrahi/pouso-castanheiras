import type { Locale } from '@/lib/types';

export interface PackageContent {
  name: Record<Locale, string>;
  meta: Record<Locale, string>;
  img: string;
  body: Record<Locale, string>;
  /** Indices into content/activities.ts ACTIVITIES, in itinerary order */
  acts: number[];
}

export interface PackagePrice {
  low: number;
  high: number;
  special: number | null;
}

// Order: Rio Negro, Macucus, Ajuricaba, Pouso — matches dc.html PKGS/PRICES index order.
export const PRICES: PackagePrice[] = [
  { low: 21400, high: 24900, special: null },
  { low: 29000, high: 33800, special: 39000 },
  { low: 37500, high: 43400, special: 49900 },
  { low: 6000, high: 7400, special: 8500 },
];

export const PACKAGES: PackageContent[] = [
  {
    name: { pt: 'Rio Negro', en: 'Rio Negro' },
    meta: { pt: 'Pacote · 3 noites', en: 'Package · 3 nights' },
    img: 'img/a02-1.jpg',
    body: {
      pt: 'Três noites com as atividades da propriedade e as duas saídas de lancha mais marcantes da região: o pôr do sol entre as ilhas de Anavilhanas, com focagem noturna, e a visita ao arquipélago com uma comunidade ribeirinha.',
      en: "Three nights with the property's own activities plus the two most memorable boat trips in the region: the sunset among the Anavilhanas islands with night spotting, and the visit to the archipelago with a riverside community.",
    },
    acts: [0, 3, 1, 2, 4],
  },
  {
    name: { pt: 'Macucus', en: 'Macucus' },
    meta: { pt: 'Pacote · 4 noites', en: 'Package · 4 nights' },
    img: 'img/trilha-castanheira.jpg',
    body: {
      pt: 'Quatro noites, acrescentando a imersão cultural em Novo Airão, com marchetaria, artesanato de fibras naturais e o Flutuante dos Botos, e uma tarde de pescaria recreativa ou o roteiro pelo Igarapé do Arraia e Casa de Farinha.',
      en: 'Four nights, adding the cultural immersion in Novo Airão, with marquetry, natural-fibre crafts and the Floating Dolphin platform, and an afternoon of recreational fishing or the route along the Arraia creek and the flour house.',
    },
    acts: [0, 3, 1, 2, 4, 5, 6, 7],
  },
  {
    name: { pt: 'Ajuricaba', en: 'Ajuricaba' },
    meta: { pt: 'Pacote · 5 noites · sugerido', en: 'Package · 5 nights · suggested' },
    img: 'img/grutas-madada.jpg',
    body: {
      pt: 'Cinco noites, nossa sugestão. Tempo para desconectar dos centros urbanos, relaxar de forma imersiva na natureza e incluir o passeio mais longo do roteiro: as Grutas do Madadá, com a Pedra Sanduíche e os petroglifos.',
      en: 'Five nights, our suggestion. Time to disconnect from the cities, relax fully into nature and include the longest excursion of the itinerary: the Madadá caves, with the Sandwich Rock and the petroglyphs.',
    },
    acts: [0, 3, 1, 2, 4, 5, 6, 7, 8],
  },
  {
    name: { pt: 'Pouso', en: 'Pouso' },
    meta: { pt: 'Por diária · mínimo 2 noites', en: 'Per night · minimum 2 nights' },
    img: 'img/a12-1.jpg',
    body: {
      pt: 'O lugar perfeito para quem já conhece a Amazônia, ou especificamente a região de Anavilhanas e Rio Negro, mas gostaria de se hospedar sem necessariamente repetir passeios já realizados. Usufrua apenas das atividades de mata e rio contempladas na própria propriedade, além dos serviços de pensão completa e camareira.',
      en: 'The perfect choice for those who already know the Amazon, or specifically the Anavilhanas and Rio Negro region, but would like to stay without necessarily repeating excursions. Enjoy only the forest and river activities on the property itself, plus full board and housekeeping.',
    },
    acts: [0, 1, 2],
  },
];
