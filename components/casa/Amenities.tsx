import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Amenities.module.css';

// dc.html 550-612: label + a grid of 8 amenity cards with inline icons.
const COPY = {
  label: { pt: 'Comodidades', en: 'Amenities' },
} as const satisfies Record<string, Record<Locale, string>>;

type IconName = 'meal' | 'bath' | 'bedrooms' | 'beach' | 'wifi' | 'cellar' | 'laundry' | 'fire';

const AMENITIES: { icon: IconName; title: Record<Locale, string>; desc: Record<Locale, string> }[] = [
  {
    icon: 'meal',
    title: { pt: 'Pensão completa', en: 'Full board' },
    desc: {
      pt: 'Café da manhã, almoço e jantar, com cardápio apresentado previamente e adaptável.',
      en: 'Breakfast, lunch and dinner, with a menu shared in advance and open to changes.',
    },
  },
  {
    icon: 'bath',
    title: { pt: 'Banho', en: 'Bathing' },
    desc: {
      pt: 'Toalhas padrão hotelaria, shampoo, condicionador, sabonetes, secador e chuveiro aquecido.',
      en: 'Hotel-standard towels, shampoo, conditioner, soaps, hairdryer and heated shower.',
    },
  },
  {
    icon: 'bedrooms',
    title: { pt: 'Quartos', en: 'Bedrooms' },
    desc: {
      pt: 'Roupas de cama 100% algodão e ar-condicionado.',
      en: '100% cotton bed linen and air conditioning.',
    },
  },
  {
    icon: 'beach',
    title: { pt: 'Praia e píer', en: 'Beach and pier' },
    desc: {
      pt: 'Cadeiras, guarda-sóis, toalhas e serviço de bebidas e snacks.',
      en: 'Chairs, parasols, towels and a drinks and snacks service.',
    },
  },
  {
    icon: 'wifi',
    title: { pt: 'Wi-fi', en: 'Wi-fi' },
    desc: {
      pt: 'Internet via satélite (Starlink) em toda a casa.',
      en: 'Satellite internet (Starlink) throughout the house.',
    },
  },
  {
    icon: 'cellar',
    title: { pt: 'Adega e cervejeira', en: 'Cellar and beer fridge' },
    desc: {
      pt: 'Bons vinhos e cerveja gelada sempre à disposição, cobrados à parte.',
      en: 'Good wine and cold beer always on hand, charged separately.',
    },
  },
  {
    icon: 'laundry',
    title: { pt: 'Lavanderia', en: 'Laundry' },
    desc: {
      pt: 'Máquinas de lavar e secar roupas à disposição dos hóspedes.',
      en: 'Washing and drying machines available to guests.',
    },
  },
  {
    icon: 'fire',
    title: { pt: 'Fogueira', en: 'Evening fire' },
    desc: {
      pt: 'Acesa ao final do dia, em um dos dois espaços ao ar livre.',
      en: 'Lit at the end of the day, in one of the two outdoor spaces.',
    },
  },
];

function AmenityIcon({ icon }: { icon: IconName }) {
  const shared = {
    width: 30,
    height: 30,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'var(--olive)',
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (icon) {
    case 'meal':
      return (
        <svg {...shared}>
          <path d="M4 4v6a3 3 0 0 0 6 0V4" />
          <path d="M7 10v10" />
          <path d="M17 4c-1.4 1.6-2 3.6-2 5.6V13h4V4Z" />
          <path d="M17 13v7" />
        </svg>
      );
    case 'bath':
      return (
        <svg {...shared}>
          <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
          <path d="M7 12V6a2 2 0 0 1 4 0" />
          <path d="M6 19l-1 2" />
          <path d="M18 19l1 2" />
        </svg>
      );
    case 'bedrooms':
      return (
        <svg {...shared}>
          <path d="M3 18v-7h13a4 4 0 0 1 4 4v3" />
          <path d="M3 18h18" />
          <path d="M3 11V7" />
          <circle cx="7.5" cy="8.5" r="1.6" />
        </svg>
      );
    case 'beach':
      return (
        <svg {...shared}>
          <path d="M12 4c4 0 7.5 2.6 8.5 6H3.5C4.5 6.6 8 4 12 4Z" />
          <path d="M12 4v16" />
          <path d="M9 20h6" />
        </svg>
      );
    case 'wifi':
      return (
        <svg {...shared}>
          <path d="M2.5 9.5a14 14 0 0 1 19 0" />
          <path d="M5.5 13a10 10 0 0 1 13 0" />
          <path d="M8.5 16.5a6 6 0 0 1 7 0" />
          <circle cx="12" cy="20" r=".9" fill="var(--olive)" stroke="none" />
        </svg>
      );
    case 'cellar':
      return (
        <svg {...shared}>
          <path d="M6 3h5l-.6 7a2 2 0 0 1-3.8 0Z" />
          <path d="M8.5 13v7" />
          <path d="M6 20h5" />
          <rect x="15" y="7" width="5" height="13" rx="1.4" />
          <path d="M16 3.5h3V7h-3Z" />
        </svg>
      );
    case 'laundry':
      return (
        <svg {...shared}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <circle cx="12" cy="13.5" r="4" />
          <path d="M8 6.5h3" />
        </svg>
      );
    case 'fire':
      return (
        <svg {...shared}>
          <path d="M12 3c2.5 3 4.5 5 4.5 8a4.5 4.5 0 0 1-9 0c0-1.4.6-2.6 1.5-3.8.6 1 1.2 1.5 2 1.8-.4-2.2.3-4.3 1-6Z" />
          <path d="M4 20h16" />
        </svg>
      );
  }
}

export async function Amenities() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.label}>{COPY.label[locale]}</div>
        <div className={styles.grid}>
          {AMENITIES.map((amenity) => (
            <div key={amenity.icon} className={styles.card}>
              <AmenityIcon icon={amenity.icon} />
              <div>
                <h3 className={styles.cardTitle}>{amenity.title[locale]}</h3>
                <p className={styles.cardDesc}>{amenity.desc[locale]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
