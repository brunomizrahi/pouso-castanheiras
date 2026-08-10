import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Team.module.css';

// dc.html 614-629. Note: the second paragraph (about Anavilhanas Tur) has no
// `data-en` in the source — it only exists in Portuguese there. The English
// copy below is a translation added for this bilingual build.
const COPY = {
  label: { pt: 'Nossa equipe', en: 'Our team' },
  title: { pt: 'Quem cuida da casa', en: 'Who looks after the house' },
  p1: {
    pt: 'Nosso caseiro reside na propriedade e estará à disposição para receber e orientar os hóspedes durante a estadia. Uma equipe experiente cuida das comodidades e dos serviços.',
    en: 'Our caretaker lives on the property and is on hand to welcome and guide guests throughout their stay. An experienced team looks after the facilities and services.',
  },
  p2Pre: {
    pt: 'Os passeios na região de Anavilhanas são conduzidos pela ',
    en: 'Tours in the Anavilhanas region are run by ',
  },
  p2Strong: { pt: 'Anavilhanas Tur', en: 'Anavilhanas Tur' },
  p2Post: {
    pt: ', operadora local fundada por Valmir Borges (Vermelhinho), um dos guias mais experientes do baixo Rio Negro.',
    en: ', a local operator founded by Valmir Borges (Vermelhinho), one of the most experienced guides on the lower Rio Negro.',
  },
  alt: { pt: 'Equipe do Pouso', en: 'The Pouso team' },
} as const satisfies Record<string, Record<Locale, string>>;

export async function Team() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <div className={styles.label}>{COPY.label[locale]}</div>
          <h2 className={styles.title}>{COPY.title[locale]}</h2>
          <div className={styles.copy}>
            <p>{COPY.p1[locale]}</p>
            <p className={styles.p2}>
              {COPY.p2Pre[locale]}
              <strong className={styles.strong}>{COPY.p2Strong[locale]}</strong>
              {COPY.p2Post[locale]}
            </p>
          </div>
        </div>
        <div className={styles.photos}>
          <div className={styles.photoCell}>
            <Image src="/img/a19-1.jpg" alt={COPY.alt[locale]} fill sizes="(max-width: 760px) 50vw, 25vw" className={styles.photo} />
          </div>
          <div className={styles.photoCell}>
            <Image src="/img/a19-2.jpg" alt={COPY.alt[locale]} fill sizes="(max-width: 760px) 50vw, 25vw" className={styles.photo} />
          </div>
        </div>
      </div>
    </section>
  );
}
