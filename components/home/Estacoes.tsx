import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Estacoes.module.css';

const COPY = {
  label: { pt: 'O ciclo das águas', en: 'The cycle of the waters' },
  title: { pt: 'Duas Amazônias, no mesmo lugar.', en: 'Two Amazons, in the same place.' },
  intro: {
    pt: 'Ao longo do ano, cada visita revela uma experiência diferente. O nível do Rio Negro sobe e desce cerca de dez metros, e a paisagem se transforma por completo.',
    en: 'Through the year every visit reveals a different experience. The Rio Negro rises and falls about ten metres, and the landscape changes completely.',
  },
} as const;

const SEASONS = [
  {
    img: '/img/a15-2.jpg',
    alt: { pt: 'Floresta alagada', en: 'Flooded forest' },
    badge: { pt: 'Cheia · Fevereiro a Agosto', en: 'Flood · February to August' },
    title: { pt: 'Floresta alagada', en: 'Flooded forest' },
    body: {
      pt: "Navegue pelas trilhas aquáticas que se formam nas matas de igapó, um cenário onde a floresta se transforma em espelho d'água. Canais e igarapés antes inacessíveis se abrem.",
      en: 'Paddle the water trails that form in the igapó forests, where the forest turns into a mirror of water. Channels and creeks that were unreachable open up.',
    },
  },
  {
    img: '/img/praia-lounge.jpg',
    alt: { pt: 'Praia particular', en: 'Private beach' },
    badge: { pt: 'Seca · Setembro a Janeiro', en: 'Dry season · September to January' },
    title: { pt: 'Praia particular', en: 'Private beach' },
    body: {
      pt: 'Praias de areia branca surgem nas margens do Rio Negro. Cadeiras, guarda-sóis, serviço de bebidas e a tradicional piracaia, peixe assado na areia ao anoitecer.',
      en: 'White sand beaches emerge along the Rio Negro. Chairs, parasols, drinks service and the traditional piracaia, fish roasted on the sand at dusk.',
    },
  },
] as const;

export async function Estacoes() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <div className={styles.label}>{COPY.label[locale]}</div>
        <h2 className={styles.title}>{COPY.title[locale]}</h2>
        <p className={styles.introBody}>{COPY.intro[locale]}</p>
      </div>
      <div className={styles.grid}>
        {SEASONS.map((season) => (
          <article key={season.title.pt} className={styles.card}>
            <Image
              src={season.img}
              alt={season.alt[locale]}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.photo}
            />
            <div className={styles.scrim} />
            <div className={styles.cardContent}>
              <div className={styles.badge}>{season.badge[locale]}</div>
              <h3 className={styles.cardTitle}>{season.title[locale]}</h3>
              <p className={styles.cardBody}>{season.body[locale]}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
