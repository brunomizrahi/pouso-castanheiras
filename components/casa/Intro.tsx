import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Intro.module.css';

// dc.html 457-496: text column + a 3-photo "quad" gallery and a stats strip.
const COPY = {
  lead: {
    pt: 'Um refúgio onde cada detalhe se harmoniza com a floresta e a natureza se faz presente em todos os espaços.',
    en: 'A refuge where every detail sits in harmony with the forest, and nature is present in every space.',
  },
  p1: {
    pt: 'A casa possui uma suíte e dois quartos com banheiro compartilhado, hospedando confortavelmente 6 pessoas. Podem ser adicionadas até duas camas extras para crianças de até 12 anos.',
    en: 'The house has one suite and two bedrooms with a shared bathroom, comfortably sleeping 6 people. Up to two extra beds can be added for children up to 12.',
  },
  p2: {
    pt: 'A maior parte do mobiliário é autoral, desenhado exclusivamente para o Pouso. Os beirais do telhado são inspirados nos projetos de Severiano Mário Porto, referência da arquitetura amazônica.',
    en: 'Most of the furniture was designed exclusively for the Pouso. The roof eaves are inspired by the work of Severiano Mário Porto, a reference in Amazonian architecture.',
  },
  alt: {
    living: { pt: 'Sala de estar aberta para a floresta', en: 'Living room open to the forest' },
    bedroom: { pt: 'Quarto com dossel', en: 'Room with canopy bed' },
    deck: { pt: 'Deck ao anoitecer', en: 'Deck at dusk' },
  },
  stats: [
    { value: '1', label: { pt: 'Suíte', en: 'Suite' } },
    { value: '2', label: { pt: 'Quartos', en: 'Bedrooms' } },
    { value: '2', label: { pt: 'Banheiros', en: 'Bathrooms' } },
    { value: '6', label: { pt: 'Hóspedes', en: 'Guests' } },
  ],
} as const;

export async function Intro() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <p className={styles.lead}>{COPY.lead[locale]}</p>
          <p className={styles.body}>{COPY.p1[locale]}</p>
          <p className={`${styles.body} ${styles.bodySpaced}`}>{COPY.p2[locale]}</p>
        </div>
        <div className={styles.gallery}>
          <div className={styles.quad}>
            <div className={`${styles.imgCell} ${styles.tall}`}>
              <Image src="/img/a08-1.jpg" alt={COPY.alt.living[locale]} fill sizes="(max-width: 760px) 100vw, 30vw" className={styles.img} />
            </div>
            <div className={styles.imgCell}>
              <Image src="/img/a10-3.jpg" alt={COPY.alt.bedroom[locale]} fill sizes="(max-width: 760px) 50vw, 22vw" className={styles.img} />
            </div>
            <div className={styles.imgCell}>
              <Image src="/img/a12-3.jpg" alt={COPY.alt.deck[locale]} fill sizes="(max-width: 760px) 50vw, 22vw" className={styles.img} />
            </div>
          </div>
          <div className={styles.stats}>
            {COPY.stats.map((stat) => (
              <div key={stat.label.en} className={styles.stat}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label[locale]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
