import type { Locale } from '@/lib/types';

export interface ItineraryDay {
  n: string;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  img: string;
}

// Flat PT -> EN lookup, transcribed verbatim from dc.html line 1832 (ROT_EN).
const ROT_EN: Record<string, string> = {
  Chegada: 'Arrival',
  Rio: 'River',
  Anavilhanas: 'Anavilhanas',
  Partida: 'Departure',
  Cultura: 'Culture',
  Madadá: 'Madadá',
  'Travessia e primeiros passos na mata': 'The crossing and first steps in the forest',
  'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia. Fogueira ao anoitecer.':
    'Arrival in Novo Airão and a 15-minute crossing to the pier. Lunch at the house, a free afternoon on the deck and the forest and agroforestry trail at the end of the day. A fire at dusk.',
  'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.':
    'Arrival in Novo Airão and a 15-minute crossing to the pier. Lunch at the house, a free afternoon on the deck and the forest and agroforestry trail at the end of the day.',
  'Praia ou floresta alagada, e a noite no rio': 'Beach or flooded forest, and a night on the river',
  'Manhã de canoa, stand-up paddle e mergulho: na praia particular, na seca, ou entre os igapós, na cheia. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas.':
    'A morning of canoeing, stand-up paddle and swimming: on the private beach in the dry season, or among the igapós in the flood. Late afternoon, a boat trip for the sunset and night spotting among the islands.',
  'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.':
    'A morning of canoeing, stand-up paddle and swimming. Late afternoon, a boat trip for the sunset and night spotting among the Anavilhanas islands.',
  'Arquipélago e comunidade ribeirinha': 'Archipelago and riverside community',
  'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária. À noite, piracaia na praia, na época de seca.':
    'A full day in Anavilhanas National Park, with a visit to a traditional community and the option of lunch at the community-run restaurant. In the evening, piracaia on the beach during the dry season.',
  'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.':
    'A full day in Anavilhanas National Park, with a visit to a traditional community and the option of lunch at the community-run restaurant.',
  'Manhã livre e check-out': 'A free morning and check-out',
  'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.':
    'An unhurried breakfast, a last swim in the river and the crossing back to Novo Airão. Check-out at 12pm.',
  'Maravilhas culturais de Novo Airão': 'Cultural wonders of Novo Airão',
  'City tour pela Fundação Almerinda Malaquias, a Associação das Artesãs, a loja Waimiri Atroari e o Flutuante dos Botos. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia.':
    'A city tour of the Almerinda Malaquias Foundation, the Artisans Association, the Waimiri Atroari shop and the Floating Dolphin platform. In the afternoon, recreational fishing or the Arraia creek and the flour house. In the evening, piracaia on the beach.',
  'Grutas do Madadá': 'Madadá caves',
  'O passeio mais longo do roteiro: subida do Rio Negro em busca da Pedra Sanduíche, dos petroglifos e das Grutas do Madadá, com trilha de 1h15 e piquenique na mata.':
    'The longest excursion of the itinerary: up the Rio Negro in search of the Sandwich Rock, the petroglyphs and the Madadá caves, with a 1h15 trail and a picnic in the forest.',
  'Novo Airão e o Igarapé do Arraia': 'Novo Airão and the Arraia creek',
  'City tour cultural em Novo Airão pela manhã. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia, na época de seca.':
    'A cultural city tour of Novo Airão in the morning. In the afternoon, recreational fishing or the Arraia creek and the flour house. In the evening, piracaia on the beach during the dry season.',
};

function withEn(pt: string): Record<Locale, string> {
  return { pt, en: ROT_EN[pt] ?? pt };
}

// Raw PT day data transcribed verbatim from dc.html lines 1758-1780 (ROTEIROS),
// one array per package in order [Rio Negro (3 nights), Macucus (4 nights), Ajuricaba (5 nights)].
const ROTEIROS_PT: { n: string; label: string; title: string; body: string; img: string }[][] = [
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia. Fogueira ao anoitecer.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho: na praia particular, na seca, ou entre os igapós, na cheia. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária. À noite, piracaia na praia, na época de seca.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Cultura',
      title: 'Maravilhas culturais de Novo Airão',
      body: 'City tour pela Fundação Almerinda Malaquias, a Associação das Artesãs, a loja Waimiri Atroari e o Flutuante dos Botos. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia.',
      img: 'img/artesas.jpg',
    },
    {
      n: '05',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
  [
    {
      n: '01',
      label: 'Chegada',
      title: 'Travessia e primeiros passos na mata',
      body: 'Chegada a Novo Airão e travessia de 15 minutos até o píer. Almoço na casa, tarde livre no deck e a Trilha na mata e Agrofloresta ao final do dia.',
      img: 'img/a03-1.jpg',
    },
    {
      n: '02',
      label: 'Rio',
      title: 'Praia ou floresta alagada, e a noite no rio',
      body: 'Manhã de canoa, stand-up paddle e mergulho. No final da tarde, saída de lancha para o pôr do sol e a focagem noturna entre as ilhas de Anavilhanas.',
      img: 'img/focagem-noturna.jpg',
    },
    {
      n: '03',
      label: 'Anavilhanas',
      title: 'Arquipélago e comunidade ribeirinha',
      body: 'Dia inteiro no Parque Nacional de Anavilhanas, com visita a uma comunidade tradicional e opção de almoço no restaurante de base comunitária.',
      img: 'img/a17-1.jpg',
    },
    {
      n: '04',
      label: 'Madadá',
      title: 'Grutas do Madadá',
      body: 'O passeio mais longo do roteiro: subida do Rio Negro em busca da Pedra Sanduíche, dos petroglifos e das Grutas do Madadá, com trilha de 1h15 e piquenique na mata.',
      img: 'img/grutas-madada.jpg',
    },
    {
      n: '05',
      label: 'Cultura',
      title: 'Novo Airão e o Igarapé do Arraia',
      body: 'City tour cultural em Novo Airão pela manhã. À tarde, pescaria recreativa ou o Igarapé do Arraia e a Casa de Farinha. À noite, piracaia na praia, na época de seca.',
      img: 'img/artesas.jpg',
    },
    {
      n: '06',
      label: 'Partida',
      title: 'Manhã livre e check-out',
      body: 'Café da manhã sem pressa, último banho de rio e travessia de volta a Novo Airão. Check-out às 12h.',
      img: 'img/praia-lounge.jpg',
    },
  ],
];

export const ROTEIROS: ItineraryDay[][] = ROTEIROS_PT.map((roteiro) =>
  roteiro.map((day) => ({
    n: day.n,
    label: withEn(day.label),
    title: withEn(day.title),
    body: withEn(day.body),
    img: day.img,
  }))
);
