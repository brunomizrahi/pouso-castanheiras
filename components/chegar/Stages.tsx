import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Stages.module.css';

// dc.html 766-800: "As etapas" divider, then 3 numbered articles (photo, eyebrow, title, body).
const LABEL = { pt: 'As etapas', en: 'The stages' } as const satisfies Record<Locale, string>;

const STAGES: {
  n: string;
  img: string;
  alt: string;
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
}[] = [
  {
    n: '01',
    img: '/img/a26-1.jpg',
    alt: 'Vista aérea do Rio Negro',
    eyebrow: { pt: 'Voando para Manaus', en: 'Flying to Manaus' },
    title: { pt: 'Aeroporto Eduardo Gomes', en: 'Eduardo Gomes Airport' },
    body: {
      pt: 'Voos diários de diversas cidades do Brasil e do mundo. Diretos de São Paulo (4h), Brasília (3h), Recife e Fortaleza (3h40) e Belém (2h).',
      en: 'Daily flights from cities across Brazil and the world. Direct from São Paulo (4h), Brasília (3h), Recife and Fortaleza (3h40) and Belém (2h).',
    },
  },
  {
    n: '02',
    img: '/img/a22-1.jpg',
    alt: 'O Rio Negro visto do alto',
    eyebrow: { pt: 'Traslado até Novo Airão', en: 'Transfer to Novo Airão' },
    title: { pt: '2h45 por terra ou 40 min de hidroavião', en: '2h45 by road or 40 min by seaplane' },
    body: {
      pt: 'Por terra, em carro particular com motoristas credenciados. Por ar, o hidroavião pousa diretamente no píer do Pouso, dispensando a etapa 03.',
      en: 'By road, in a private car with accredited drivers. By air, the seaplane lands directly at the Pouso’s pier, skipping stage 03.',
    },
  },
  {
    n: '03',
    img: '/img/a03-1.jpg',
    alt: 'Píer do Pouso das Castanheiras',
    eyebrow: { pt: 'De barco até o Pouso', en: 'By boat to the Pouso' },
    title: { pt: '15 minutos de travessia', en: 'A 15-minute crossing' },
    body: {
      pt: 'Do porto em Novo Airão até o píer do Pouso, em nosso barco próprio. A cidade fica a 15 minutos e tem farmácia, banco e hospital.',
      en: 'From the port in Novo Airão to the Pouso’s pier, in our own boat. The town is 15 minutes away and has a pharmacy, bank and hospital.',
    },
  },
];

export async function Stages() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>{LABEL[locale]}</span>
        <span className={styles.line} />
      </div>
      <div className={styles.grid}>
        {STAGES.map((stage) => (
          <article key={stage.n} className={styles.article}>
            <div className={styles.imageWrap}>
              <Image src={stage.img} alt={stage.alt} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.image} />
            </div>
            <div className={styles.meta}>
              <span className={styles.number}>{stage.n}</span>
              <span className={styles.eyebrow}>{stage.eyebrow[locale]}</span>
            </div>
            <h3 className={styles.title}>{stage.title[locale]}</h3>
            <p className={styles.body}>{stage.body[locale]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
