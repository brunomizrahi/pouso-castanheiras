import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Manifesto.module.css';

const COPY = {
  label: { pt: 'Por que estamos aqui', en: 'Why we are here' },
  title: {
    pt: 'Mais do que uma hospedagem, um modo de estar na natureza.',
    en: 'More than a place to stay. A way of being in nature.',
  },
  p1: {
    pt: 'Localizado na região do majestoso Rio Negro e do Parque Nacional de Anavilhanas, o Pouso é um refúgio exclusivo em meio à floresta amazônica, no município de Novo Airão (AM). São 26 hectares de natureza intocada, onde cada detalhe foi pensado para proporcionar uma vivência única, imersiva e inesquecível.',
    en: 'Set in the region of the majestic Rio Negro and Anavilhanas National Park, the Pouso is an exclusive refuge in the middle of the Amazon rainforest, in the municipality of Novo Airão (AM). Twenty-six hectares of untouched nature, where every detail was considered to create a singular, immersive and unforgettable stay.',
  },
  p2: {
    pt: 'O projeto nasceu da união de três amigos encantados com a Amazônia. Depois de anos navegando seus rios, convivendo com comunidades e aprendendo com o ritmo da floresta, surgiu o desejo comum de criar um lugar que refletisse esse aprendizado, com respeito aos saberes locais, autenticidade e conforto.',
    en: 'The project was born from three friends who fell for the Amazon. After years navigating its rivers, living alongside communities and learning the rhythm of the forest, they shared a wish to create a place that reflected what they had learned, with respect for local knowledge, authenticity and comfort.',
  },
  p3: {
    pt: 'Cada espaço foi pensado para acolher e inspirar, proporcionando ao visitante a experiência de se sentir em casa, na maior floresta tropical do planeta.',
    en: 'Every space was designed to welcome and inspire, so that guests feel at home inside the largest tropical forest on the planet.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export async function Manifesto() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.split}>
        <div className={styles.sticky}>
          <div className={styles.label}>{COPY.label[locale]}</div>
          <h2 className={styles.title}>{COPY.title[locale]}</h2>
        </div>
        <div className={styles.copy}>
          <p>{COPY.p1[locale]}</p>
          <p>{COPY.p2[locale]}</p>
          <p className={styles.pullQuote}>{COPY.p3[locale]}</p>
        </div>
      </div>
    </section>
  );
}
