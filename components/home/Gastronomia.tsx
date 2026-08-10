import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Gastronomia.module.css';

const COPY = {
  label: { pt: 'Gastronomia', en: 'Dining' },
  title: { pt: 'Não há cardápio fixo.', en: 'There is no fixed menu.' },
  p1: {
    pt: 'O coração da casa é a sala de estar e jantar, aberta para a floresta. Ao redor de uma grande mesa feita na melhor tradição da marcenaria local, compartilham-se sabores e histórias.',
    en: 'The heart of the house is the living and dining room, open to the forest. Around a large table built in the finest local carpentry tradition, flavours and stories are shared.',
  },
  p2: {
    pt: 'A cozinha é abastecida por uma horta orgânica, ovos do próprio galinheiro e ingredientes regionais. Cada grupo tem suas preferências, restrições e desejos considerados previamente. Tudo é planejado em conjunto, respeitando a sazonalidade.',
    en: "The kitchen is supplied by an organic garden, eggs from our own hen house and regional ingredients. Every group's preferences, restrictions and wishes are considered beforehand. Everything is planned together, following the seasons.",
  },
  fullBoard: {
    title: { pt: 'Pensão completa', en: 'Full board' },
    desc: {
      pt: 'Café da manhã, almoço e jantar, inclusos em todos os pacotes.',
      en: 'Breakfast, lunch and dinner, included in every package.',
    },
  },
  cellar: {
    title: { pt: 'Adega e cervejeira', en: 'Cellar and beer fridge' },
    desc: {
      pt: 'Bons vinhos e cerveja gelada sempre à disposição, cobrados à parte.',
      en: 'Good wine and cold beer always on hand, charged separately.',
    },
  },
  alt: {
    table: { pt: 'Mesa servida', en: 'Table set' },
    fruit: { pt: 'Frutas da região', en: 'Regional fruit' },
    kitchen: { pt: 'Cozinha', en: 'Kitchen' },
  },
} as const;

function MealIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--sand)"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.icon}
    >
      <path d="M4 4v6a3 3 0 0 0 6 0V4" />
      <path d="M7 10v10" />
      <path d="M17 4c-1.4 1.6-2 3.6-2 5.6V13h4V4Z" />
      <path d="M17 13v7" />
    </svg>
  );
}

function CellarIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--sand)"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.icon}
    >
      <path d="M6 3h5l-.6 7a2 2 0 0 1-3.8 0Z" />
      <path d="M8.5 13v7" />
      <path d="M6 20h5" />
      <rect x="15" y="7" width="5" height="13" rx="1.4" />
      <path d="M16 3.5h3V7h-3Z" />
    </svg>
  );
}

export async function Gastronomia() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <div className={styles.label}>{COPY.label[locale]}</div>
            <h2 className={styles.title}>{COPY.title[locale]}</h2>
            <div className={styles.copy}>
              <p>{COPY.p1[locale]}</p>
              <p>{COPY.p2[locale]}</p>
            </div>
            <div className={styles.features}>
              <div className={styles.feature}>
                <MealIcon />
                <div>
                  <div className={styles.featureTitle}>{COPY.fullBoard.title[locale]}</div>
                  <div className={styles.featureDesc}>{COPY.fullBoard.desc[locale]}</div>
                </div>
              </div>
              <div className={styles.feature}>
                <CellarIcon />
                <div>
                  <div className={styles.featureTitle}>{COPY.cellar.title[locale]}</div>
                  <div className={styles.featureDesc}>{COPY.cellar.desc[locale]}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.photos}>
            <div className={`${styles.photoCell} ${styles.photoWide}`}>
              <Image src="/img/a06-1.jpg" alt={COPY.alt.table[locale]} fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.photo} />
            </div>
            <div className={styles.photoCell}>
              <Image src="/img/a09-3.jpg" alt={COPY.alt.fruit[locale]} fill sizes="(max-width: 900px) 50vw, 25vw" className={styles.photo} />
            </div>
            <div className={styles.photoCell}>
              <Image src="/img/a09-4.jpg" alt={COPY.alt.kitchen[locale]} fill sizes="(max-width: 900px) 50vw, 25vw" className={styles.photo} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
