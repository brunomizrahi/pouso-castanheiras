import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './Mosaic.module.css';

const COPY = {
  propertyLabel: { pt: 'A propriedade', en: 'The property' },
  propertyCaption: {
    pt: 'hectares de floresta preservada, cerca de 26 campos de futebol.',
    en: 'hectares of preserved forest, about 26 football pitches.',
  },
  exclusiveLabel: { pt: 'Uso exclusivo', en: 'Exclusive use' },
  exclusiveCaption: {
    pt: 'hóspedes. Uma suíte e dois quartos, sempre para um único grupo.',
    en: 'guests. One suite and two bedrooms, always for a single group.',
  },
  fromManausLabel: { pt: 'De Manaus', en: 'From Manaus' },
  fromManausCaption: {
    pt: 'por terra até Novo Airão. Ou 40 min de hidroavião, direto ao píer.',
    en: 'by road to Novo Airão. Or 40 min by seaplane, straight to the pier.',
  },
  everythingReady: { pt: 'Tudo já está resolvido para você.', en: 'Everything is already taken care of.' },
  exploreHouse: { pt: 'Conheça a casa', en: 'Explore the house' },
  amenities: [
    { label: { pt: 'Pensão completa', en: 'Full board' }, icon: 'meal' as const },
    { label: { pt: 'Camareira', en: 'Housekeeping' }, icon: 'housekeeping' as const },
    { label: { pt: 'Starlink', en: 'Starlink' }, icon: 'starlink' as const },
    { label: { pt: 'Adega', en: 'Wine cellar' }, icon: 'wine' as const },
    { label: { pt: 'Fogueira', en: 'Evening fire' }, icon: 'fire' as const },
  ],
  alt: {
    house: { pt: 'A casa', en: 'The house' },
    dining: { pt: 'Sala de jantar', en: 'Dining room' },
    bedroom: { pt: 'Quarto com dossel', en: 'Room with canopy bed' },
    deck: { pt: 'Deck externo', en: 'Outdoor deck' },
  },
} as const;

function AmenityIcon({ icon }: { icon: 'meal' | 'housekeeping' | 'starlink' | 'wine' | 'fire' }) {
  const shared = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    style: { color: 'var(--olive)' },
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
    case 'housekeeping':
      return (
        <svg {...shared}>
          <path d="M4 19V9a2 2 0 0 1 2-2h9l2.5 3H20a1 1 0 0 1 1 1v8" />
          <path d="M3 19h18" />
          <path d="M8 7V5h5v2" />
        </svg>
      );
    case 'starlink':
      return (
        <svg {...shared}>
          <path d="M2.5 9.5a14 14 0 0 1 19 0" />
          <path d="M5.5 13a10 10 0 0 1 13 0" />
          <path d="M8.5 16.5a6 6 0 0 1 7 0" />
          <circle cx="12" cy="20" r=".8" fill="var(--olive)" />
        </svg>
      );
    case 'wine':
      return (
        <svg {...shared}>
          <path d="M8 3h8l-1 7a3 3 0 0 1-6 0Z" />
          <path d="M12 13v7" />
          <path d="M9 20h6" />
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

export async function Mosaic() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={`${styles.imgCell} ${styles.house}`}>
          <Image src="/img/a05-1.jpg" alt={COPY.alt.house[locale]} fill sizes="(max-width: 760px) 100vw, 42vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.propertyCard}`}>
          <div className={styles.cardLabelOnOlive}>{COPY.propertyLabel[locale]}</div>
          <div>
            <div className={styles.bigNumber}>26</div>
            <div className={styles.captionOnOlive}>{COPY.propertyCaption[locale]}</div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.exclusiveCard}`}>
          <div className={styles.cardLabel}>{COPY.exclusiveLabel[locale]}</div>
          <div>
            <div className={styles.midNumber}>6</div>
            <div className={styles.caption}>{COPY.exclusiveCaption[locale]}</div>
          </div>
        </div>

        <div className={`${styles.imgCell} ${styles.dining}`}>
          <Image src="/img/a08-5.jpg" alt={COPY.alt.dining[locale]} fill sizes="(max-width: 760px) 100vw, 58vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.bedroom}`}>
          <Image src="/img/a10-3.jpg" alt={COPY.alt.bedroom[locale]} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.manausCard}`}>
          <div className={styles.cardLabel}>{COPY.fromManausLabel[locale]}</div>
          <div>
            <div className={styles.midNumber}>2h45</div>
            <div className={styles.captionDark}>{COPY.fromManausCaption[locale]}</div>
          </div>
        </div>

        <div className={`${styles.imgCell} ${styles.deck}`}>
          <Image src="/img/a12-1.jpg" alt={COPY.alt.deck[locale]} fill sizes="(max-width: 760px) 100vw, 42vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.readyCard}`}>
          <p className={styles.readyTitle}>{COPY.everythingReady[locale]}</p>
          <div className={styles.amenityGrid}>
            {COPY.amenities.map((amenity) => (
              <div key={amenity.icon} className={styles.amenity}>
                <AmenityIcon icon={amenity.icon} />
                <span>{amenity.label[locale]}</span>
              </div>
            ))}
          </div>
          <Link href="/a-casa" className={styles.exploreLink}>
            {COPY.exploreHouse[locale]}
          </Link>
        </div>
      </div>
    </section>
  );
}
