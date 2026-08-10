import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './ArticleGrid.module.css';

// dc.html 1450-1536: "Também publicaram" label + divider line, a 6-up grid of outlet cards
// (photo + outlet badge, headline, italic pull quote, date + "Ler →"), then a press-contact
// note below the grid.
const COPY = {
  label: { pt: 'Também publicaram', en: 'Also published' },
  read: { pt: 'Ler →', en: 'Read →' },
  note: {
    pt: 'Para imprensa, escreva para contato@pousodascastanheiras.com.br. Retornamos com fotos em alta e mais informações.',
    en: 'For press enquiries, write to contato@pousodascastanheiras.com.br. We reply with high-resolution photos and more information.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const ARTICLES: {
  key: string;
  href: string;
  photo: string;
  outlet: string;
  title: Record<Locale, string>;
  quote: Record<Locale, string>;
  date: Record<Locale, string>;
}[] = [
  {
    key: 'panrotas',
    href: 'https://blog.panrotas.com.br/hotel-inspectors/2025/09/06/pouso-das-castanheiras-hospedagem-imersiva-na-amazonia/',
    photo: '/img/a12-2.jpg',
    outlet: 'PANROTAS · Hotel Inspectors',
    title: {
      pt: 'Pouso das Castanheiras: hospedagem imersiva na Amazônia',
      en: 'Pouso das Castanheiras: an immersive stay in the Amazon',
    },
    quote: {
      pt: '“Tudo isso com muito conforto, segurança e completa imersão na floresta e na cultura local.”',
      en: '“All of it with great comfort, safety and full immersion in the forest and the local culture.”',
    },
    date: { pt: 'Setembro 2025', en: 'September 2025' },
  },
  {
    key: 'cnn',
    href: 'https://www.cnnbrasil.com.br/viagemegastronomia/gastronomia/em-anavilhanas-farinha-de-mandioca-e-peixes-mostram-amazonia-autentica/',
    photo: '/img/a06-1.jpg',
    outlet: 'CNN Brasil',
    title: {
      pt: 'Em Anavilhanas, farinha de mandioca e peixes mostram Amazônia autêntica',
      en: 'In Anavilhanas, cassava flour and fish reveal an authentic Amazon',
    },
    quote: {
      pt: '“Hospedagem embrenhada no meio da mata com proposta de imersão na Amazônia.”',
      en: '“A stay tucked deep in the forest, built around immersion in the Amazon.”',
    },
    date: { pt: 'Fevereiro 2025', en: 'February 2025' },
  },
  {
    key: 'revista-hoteis',
    href: 'https://www.revistahoteis.com.br/pouso-das-castanheiras-oferece-imersao-atraves-da-gastronomia/',
    photo: '/img/a09-3.jpg',
    outlet: 'Revista Hotéis',
    title: {
      pt: 'Pouso das Castanheiras oferece imersão através da gastronomia',
      en: 'Pouso das Castanheiras offers immersion through its cooking',
    },
    quote: {
      pt: '“Uma verdadeira viagem sensorial através de sua gastronomia.”',
      en: '“A truly sensory journey through its cooking.”',
    },
    date: { pt: 'Junho 2025', en: 'June 2025' },
  },
  {
    key: 'now-boarding',
    href: 'https://nowboarding.com.br/pouso-das-castanheiras-amazonia/',
    photo: '/img/a02-1.jpg',
    outlet: 'Now Boarding',
    title: {
      pt: 'Na Amazônia, Pouso das Castanheiras é hospedagem na floresta',
      en: 'In the Amazon, Pouso das Castanheiras is a stay inside the forest',
    },
    quote: {
      pt: '“É viver a maior floresta tropical do mundo fora da comodidade de um quarto de hotel.”',
      en: '“It is living the largest tropical forest in the world, outside the comfort of a hotel room.”',
    },
    date: { pt: 'Abril 2025', en: 'April 2025' },
  },
  {
    key: 'guia-turismo-brasil',
    href: 'https://www.guiadoturismobrasil.com/noticia/12092/cheia-do-rio-negro-marca-nova-temporada-no-pouso-das-castanheiras-na-amazonia',
    photo: '/img/a15-2.jpg',
    outlet: 'Guia do Turismo Brasil',
    title: {
      pt: 'Cheia do Rio Negro marca nova temporada no Pouso das Castanheiras',
      en: 'The Rio Negro flood opens a new season at Pouso das Castanheiras',
    },
    quote: {
      pt: '“Um bar vintage dos anos 1970 restaurado por marceneiros locais.”',
      en: '“A vintage 1970s bar restored by local carpenters.”',
    },
    date: { pt: 'Maio 2025', en: 'May 2025' },
  },
  {
    key: 'paes-pelo-mundo',
    href: 'https://www.paespelomundo.com.br/post/pouso-das-castanheiras-a-porta-de-entrada-para-uma-imers%C3%A3o-aut%C3%AAntica-na-amaz%C3%B4nia',
    photo: '/img/a17-1.jpg',
    outlet: 'Paes pelo Mundo',
    title: {
      pt: 'A porta de entrada para uma imersão autêntica na Amazônia',
      en: 'The gateway to an authentic immersion in the Amazon',
    },
    quote: {
      pt: '“A porta de entrada para uma imersão autêntica na Amazônia.”',
      en: '“The gateway to an authentic immersion in the Amazon.”',
    },
    date: { pt: 'Março 2025', en: 'March 2025' },
  },
];

export async function ArticleGrid() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>{COPY.label[locale]}</span>
        <span className={styles.line} />
      </div>
      <div className={styles.grid}>
        {ARTICLES.map((article) => (
          <a key={article.key} href={article.href} target="_blank" rel="noreferrer" className={styles.card}>
            <span className={styles.imageWrap}>
              <Image src={article.photo} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.image} />
              <span className={styles.badge}>{article.outlet}</span>
            </span>
            <span className={styles.body}>
              <span>
                <span className={styles.title}>{article.title[locale]}</span>
                <span className={styles.quote}>{article.quote[locale]}</span>
              </span>
              <span className={styles.footer}>
                <span>{article.date[locale]}</span>
                <span className={styles.read}>{COPY.read[locale]}</span>
              </span>
            </span>
          </a>
        ))}
      </div>
      <p className={styles.note}>{COPY.note[locale]}</p>
    </section>
  );
}
