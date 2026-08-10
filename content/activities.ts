import type { Locale } from '@/lib/types';

export interface Activity {
  /** Two-digit display number, e.g. "01" */
  n: string;
  t: Record<Locale, string>;
  dur: Record<Locale, string>;
  season: Record<Locale, string>;
  packs: Record<Locale, string>;
  img: string;
  img2: string;
  body: Record<Locale, string>;
  quote: Record<Locale, string>;
  by: string;
}

export const ACTIVITIES: Activity[] = [
  {
    n: '01',
    t: { pt: 'Trilha na mata e Agrofloresta', en: 'Forest trail and agroforestry' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/trilha-castanheira.jpg',
    img2: 'img/a15-1.jpg',
    body: {
      pt: 'Descubra árvores centenárias como Castanheiras e Macucus, e desfrute da biodiversidade amazônica em nossas trilhas contemplativas, de fácil acesso, na mata primária do Pouso. Vivencie o nascer de novas florestas comestíveis, plantadas com as técnicas agroflorestais, em companhia das pessoas que cuidam dos plantios.',
      en: "Discover centuries-old trees such as Brazil nut and Macucu, and enjoy Amazonian biodiversity on our contemplative, easy-access trails through the Pouso's primary forest. Watch new edible forests take root, planted with agroforestry techniques, alongside the people who tend them.",
    },
    quote: {
      pt: '“Uma verdadeira experiência de imersão na Amazônia.”',
      en: '“A true experience of immersion in the Amazon.”',
    },
    by: 'Tom Rera e família',
  },
  {
    n: '02',
    t: { pt: 'Praia ou Floresta Alagada, Canoas e Mergulho no Rio', en: 'Beach or flooded forest, canoes and river swimming' },
    dur: { pt: 'Livre', en: 'Open' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/praia-lounge.jpg',
    img2: 'img/canoa-igapo.jpg',
    body: {
      pt: 'Na época de seca (set–jan), desfrute da linda praia particular que dispomos no Pouso. Na época de cheia (fev–ago), explore os igapós e florestas alagadas que circundam a propriedade. Em ambas as estações, pratique canoagem, stand-up paddle e um revigorante mergulho no rio.',
      en: 'In the dry season (Sep–Jan), enjoy the beautiful private beach at the Pouso. In the flood season (Feb–Aug), explore the igapós and flooded forests surrounding the property. In both seasons, try canoeing, stand-up paddle and a refreshing swim in the river.',
    },
    quote: {
      pt: '“Remar de canoa cabocla é a melhor maneira de explorar o rio em sua plenitude.”',
      en: '“Paddling a traditional canoe is the best way to explore the river in full.”',
    },
    by: 'Equipe do Pouso',
  },
  {
    n: '03',
    t: { pt: 'Piracaia na praia', en: 'Piracaia on the beach' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Seca (set–jan)', en: 'Dry season (Sep–Jan)' },
    packs: { pt: 'Todos', en: 'All' },
    img: 'img/piracaia-praia.jpg',
    img2: 'img/luau-praia.jpg',
    body: {
      pt: 'Na época de seca, a depender da condição meteorológica, servimos uma tradicional piracaia na praia particular do Pouso: um jantar de assado tradicional de peixe. Opcional: luau na praia com produção e ambientação especial, sujeito a consulta de disponibilidade e valores.',
      en: "In the dry season, weather permitting, we serve a traditional piracaia on the Pouso's private beach, a dinner of fish roasted in the traditional way. Optional: a luau on the beach with special staging and atmosphere, subject to availability and pricing.",
    },
    quote: {
      pt: '“A comida super gostosa, e a descoberta de alimentos típicos da região foram um sucesso total.”',
      en: '“The food was delicious, and discovering the region\'s typical ingredients was a complete success.”',
    },
    by: 'Bruna Constantino e família',
  },
  {
    n: '04',
    t: { pt: 'Pôr do Sol e Focagem Noturna', en: 'Sunset and night spotting' },
    dur: { pt: '3h', en: '3h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Rio Negro, Macucus, Ajuricaba', en: 'Rio Negro, Macucus, Ajuricaba' },
    img: 'img/focagem-noturna.jpg',
    img2: 'img/a16-1.jpg',
    body: {
      pt: 'Saída de lancha no final da tarde para o pôr do sol no meio das ilhas de Anavilhanas, seguida de focagem com possibilidade de avistamento de espécies de hábitos noturnos, como corujas, jacarés e preguiças. Esse é um dos passeios mais emocionantes e sensoriais oferecidos, pois permite sentir o rio e a floresta no silêncio da noite.',
      en: 'A late-afternoon boat trip for the sunset among the Anavilhanas islands, followed by night spotting with the chance to see nocturnal species such as owls, caimans and sloths. This is one of the most moving and sensory excursions we offer, letting you feel the river and the forest in the silence of the night.',
    },
    quote: {
      pt: '“À noite você pode desfrutar do show sonoro único da floresta.”',
      en: '“At night you can enjoy the forest\'s unique sound show.”',
    },
    by: 'Tom Rera e família',
  },
  {
    n: '05',
    t: { pt: 'Arquipélago de Anavilhanas e Comunidade Ribeirinha', en: 'Anavilhanas archipelago and riverside community' },
    dur: { pt: '3h a 4h', en: '3h to 4h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Rio Negro, Macucus, Ajuricaba', en: 'Rio Negro, Macucus, Ajuricaba' },
    img: 'img/a17-1.jpg',
    img2: 'img/comunidade-ribeirinha.jpg',
    body: {
      pt: 'Visite o Parque Nacional de Anavilhanas, 2º maior arquipélago fluvial do mundo, com as místicas florestas alagadas na época de cheia, ou incríveis praias de areia branca no leito do Rio Negro na época de seca. Conheça o modo de vida amazônico visitando uma comunidade tradicional ribeirinha, com opção de almoço no restaurante de base comunitária, colaborando para a geração de renda local.',
      en: 'Visit Anavilhanas National Park, the second largest river archipelago in the world, with its mystical flooded forests in the flood season, or incredible white sand beaches on the bed of the Rio Negro in the dry season. Get to know Amazonian life by visiting a traditional riverside community, with the option of lunch at the community-run restaurant, contributing to local income.',
    },
    quote: {
      pt: '“Se a Amazônia é o paraíso dos mistérios, o Pouso é o próprio portal.”',
      en: '“If the Amazon is the paradise of mysteries, the Pouso is the gateway itself.”',
    },
    by: 'Marcus Ozi',
  },
  {
    n: '06',
    t: { pt: 'Maravilhas culturais de Novo Airão', en: 'Cultural wonders of Novo Airão' },
    dur: { pt: '2h30', en: '2h30' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/artesas.jpg',
    img2: 'img/novo-airao.jpg',
    body: {
      pt: 'City tour em Novo Airão: visita à Fundação Almerinda Malaquias, instituto ligado ao trabalho de marchetaria com aproveitamento sustentável de madeiras típicas da região; à Associação das Artesãs de Novo Airão, cooperativa com produção à base de cipó-ambé, arumã e outras fibras naturais; à loja da etnia indígena Waimiri Atroari; e, por último, ao Flutuante dos Botos.',
      en: 'A city tour of Novo Airão: a visit to the Almerinda Malaquias Foundation, an institute devoted to marquetry using sustainably sourced regional woods; to the Novo Airão Artisans Association, a cooperative working with cipó-ambé, arumã and other natural fibres; to the Waimiri Atroari indigenous shop; and finally to the Floating Dolphin platform.',
    },
    quote: {
      pt: '“Muito amor por toda parte. O Pouso prometeu e entregou tudo.”',
      en: '“Love everywhere you look. The Pouso promised and delivered everything.”',
    },
    by: 'Ana Carolina Srougi e família Soares',
  },
  {
    n: '07',
    t: { pt: 'Pescaria recreativa', en: 'Recreational fishing' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Ano todo', en: 'All year' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/a16-1.jpg',
    img2: 'img/a17-1.jpg',
    body: {
      pt: 'Relaxe e contemple as paisagens enquanto tenta pescar um tucunaré ou uma piranha no final da tarde, no meio das ilhas de Anavilhanas. Alternativa ao passeio pelo Igarapé do Arraia quando o nível do rio não permite o acesso.',
      en: 'Relax and take in the landscape while trying to catch a peacock bass or a piranha in the late afternoon, among the Anavilhanas islands. An alternative to the Arraia creek trip when the river level does not allow access.',
    },
    quote: {
      pt: '“O rio no final da tarde é outro lugar. Tudo desacelera.”',
      en: '“The river in the late afternoon is another place entirely. Everything slows down.”',
    },
    by: 'Equipe do Pouso',
  },
  {
    n: '08',
    t: { pt: 'Igarapé do Arraia e Casa de Farinha', en: 'Arraia creek and the flour house' },
    dur: { pt: '2h', en: '2h' },
    season: { pt: 'Cheia (fev–ago)', en: 'Flood season (Feb–Aug)' },
    packs: { pt: 'Macucus, Ajuricaba', en: 'Macucus, Ajuricaba' },
    img: 'img/comunidade-ribeirinha.jpg',
    img2: 'img/artesas.jpg',
    body: {
      pt: 'Na época de cheia, passeio pelo igarapé do Arraia e visita a sítios de moradores da comunidade, conhecendo a maneira como vivem e a arte tradicional de produzir farinha. É uma oportunidade para aprofundamento em relação à cultura ribeirinha, em roteiro pouco explorado na região. Se o nível do rio não permitir o acesso, optamos pela pescaria recreativa.',
      en: 'In the flood season, a trip along the Arraia creek and a visit to the smallholdings of community residents, learning how they live and the traditional art of making cassava flour. It is a chance to go deeper into riverside culture, on a route little explored in the region. If the river level does not allow access, we switch to recreational fishing.',
    },
    quote: {
      pt: '“Vivências de valor inestimável em comunidades ribeirinhas.”',
      en: '“Experiences of priceless value in riverside communities.”',
    },
    by: 'CNN Brasil',
  },
  {
    n: '09',
    t: { pt: 'Grutas do Madadá', en: 'Madadá caves' },
    dur: { pt: '5h · trilha 1h15', en: '5h · 1h15 trail' },
    season: { pt: 'Petroglifos só na seca', en: 'Petroglyphs in dry season only' },
    packs: { pt: 'Ajuricaba', en: 'Ajuricaba' },
    img: 'img/grutas-madada.jpg',
    img2: 'img/rio-negro-pedras.jpg',
    body: {
      pt: 'Suba o Rio Negro em busca da curiosa Pedra Sanduíche, das inscrições rupestres denominadas petroglifos (visíveis apenas na seca) e das famosas Grutas do Madadá, formações rochosas únicas encravadas no meio da floresta. Esse passeio é feito regularmente de lancha, acrescido de um piquenique na mata. Caso optem pelo aluguel de barco regional, com almoço servido a bordo, será cobrado um adicional no valor do pacote e o tempo de passeio aumenta para cerca de 6 a 7 horas.',
      en: 'Head up the Rio Negro in search of the curious Sandwich Rock, the rock inscriptions known as petroglyphs (visible only in the dry season) and the famous Madadá caves, unique rock formations set deep in the forest. This excursion is normally made by speedboat, with a picnic in the forest. If you opt to charter a regional boat with lunch served on board, a supplement is added to the package price and the trip extends to around 6 to 7 hours.',
    },
    quote: {
      pt: '“Formações rochosas únicas no coração da floresta.”',
      en: '“Unique rock formations in the heart of the forest.”',
    },
    by: 'Apresentação do Pouso',
  },
];
