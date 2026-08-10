import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './HouseMosaic.module.css';

// dc.html 498-548: a 12-column mosaic of room photos and text cards, closing
// with a full-width outdoor deck panel.
const COPY = {
  alt: {
    livingDining: { pt: 'Sala de estar e jantar', en: 'Living and dining room' },
    diningTable: { pt: 'Mesa de jantar', en: 'Dining table' },
    kitchen: { pt: 'Cozinha', en: 'Kitchen' },
    corridor: { pt: 'Corredor', en: 'Corridor' },
    canopyBedroom: { pt: 'Quarto com dossel', en: 'Room with canopy bed' },
    bedroom: { pt: 'Quarto', en: 'Bedroom' },
    bathroom: { pt: 'Banheiro', en: 'Bathroom' },
    amenities: { pt: 'Amenities', en: 'Amenities' },
    deckDusk: { pt: 'Deck ao anoitecer', en: 'Deck at dusk' },
    deckLoungers: { pt: 'Deck externo com espreguiçadeiras', en: 'Outdoor deck with loungers' },
  },
  livingDining: {
    label: { pt: 'Sala de estar & jantar', en: 'Living & dining room' },
    body: {
      pt: 'Aberta para a floresta. Um espaço de convivência pensado para contemplar o verde, ouvir os sons da mata e celebrar boas conversas.',
      en: 'Open to the forest. A shared space made for taking in the green, listening to the woods and enjoying good conversation.',
    },
  },
  kitchen: {
    label: { pt: 'Cozinha', en: 'Kitchen' },
    body: {
      pt: 'Espaço de encontros e aromas que se transformam em sabores à mesa dos hóspedes. Abastecida por horta orgânica e ovos do próprio galinheiro.',
      en: "A place of gatherings and aromas that become flavours at the guests' table. Supplied by our organic garden and our own hen house.",
    },
  },
  bedrooms: {
    label: { pt: 'Quartos', en: 'Bedrooms' },
    body: {
      pt: 'Ar-condicionado, dossel e armários individuais. Podem ser configurados para casal ou solteiros.',
      en: 'Air conditioning, canopy beds and individual wardrobes. Can be set up as double or twin.',
    },
  },
  deck: {
    label: { pt: 'Deck externo', en: 'Outdoor deck' },
    body: {
      pt: 'Redes e espreguiçadeiras se abrem para a mata, no cenário perfeito para o café da manhã ou uma fogueira à noite. Peça ao nosso caseiro no final do dia.',
      en: 'Hammocks and loungers open onto the forest, the perfect setting for breakfast or a fire at night. Just ask our caretaker at the end of the day.',
    },
  },
} as const;

export async function HouseMosaic() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={`${styles.imgCell} ${styles.livingDiningPhoto}`}>
          <Image src="/img/a08-1.jpg" alt={COPY.alt.livingDining[locale]} fill sizes="(max-width: 760px) 100vw, 58vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.livingDiningCard}`}>
          <div className={styles.cardLabel}>{COPY.livingDining.label[locale]}</div>
          <p className={styles.cardBody}>{COPY.livingDining.body[locale]}</p>
        </div>

        <div className={`${styles.imgCell} ${styles.diningTable}`}>
          <Image src="/img/a08-5.jpg" alt={COPY.alt.diningTable[locale]} fill sizes="(max-width: 760px) 100vw, 42vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.kitchenPhoto}`}>
          <Image src="/img/a09-4.jpg" alt={COPY.alt.kitchen[locale]} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.corridor}`}>
          <Image src="/img/a08-4.jpg" alt={COPY.alt.corridor[locale]} fill sizes="(max-width: 760px) 100vw, 25vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.kitchenCard}`}>
          <div className={styles.cardLabelOnOlive}>{COPY.kitchen.label[locale]}</div>
          <p className={styles.cardBodyOnOlive}>{COPY.kitchen.body[locale]}</p>
        </div>

        <div className={`${styles.imgCell} ${styles.canopyBedroom}`}>
          <Image src="/img/a10-3.jpg" alt={COPY.alt.canopyBedroom[locale]} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.bedroom}`}>
          <Image src="/img/a10-4.jpg" alt={COPY.alt.bedroom[locale]} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.img} />
        </div>

        <div className={`${styles.card} ${styles.bedroomsCard}`}>
          <div className={styles.cardLabel}>{COPY.bedrooms.label[locale]}</div>
          <p className={styles.cardBody}>{COPY.bedrooms.body[locale]}</p>
        </div>

        <div className={`${styles.imgCell} ${styles.bathroom}`}>
          <Image src="/img/a11-2.jpg" alt={COPY.alt.bathroom[locale]} fill sizes="(max-width: 760px) 50vw, 25vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.amenitiesPhoto}`}>
          <Image src="/img/a11-3.jpg" alt={COPY.alt.amenities[locale]} fill sizes="(max-width: 760px) 50vw, 25vw" className={styles.img} />
        </div>

        <div className={`${styles.imgCell} ${styles.deckDusk}`}>
          <Image src="/img/a12-3.jpg" alt={COPY.alt.deckDusk[locale]} fill sizes="(max-width: 760px) 100vw, 50vw" className={styles.img} />
        </div>

        <div className={styles.deckPanel}>
          <Image
            src="/img/a12-1.jpg"
            alt={COPY.alt.deckLoungers[locale]}
            fill
            sizes="100vw"
            style={{ objectPosition: 'center 42%' }}
            className={styles.img}
          />
          <div className={styles.deckScrim} />
          <div className={styles.deckContent}>
            <div className={styles.cardLabelOnOlive}>{COPY.deck.label[locale]}</div>
            <p className={styles.deckBody}>{COPY.deck.body[locale]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
