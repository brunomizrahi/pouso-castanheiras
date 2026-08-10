import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Intro.module.css';

// dc.html 745-753: eyebrow + h1 on the left, lead paragraph on the right, bottom-aligned.
const COPY = {
  eyebrow: { pt: 'Como chegar', en: 'Getting here' },
  titleLine1: { pt: 'Três etapas até', en: 'Three stages to' },
  titleLine2: { pt: 'o píer', en: 'the pier' },
  body: {
    pt: 'O hóspede escolhe a modalidade de transfer e o Pouso organiza tudo: motoristas credenciados, horários e a travessia de barco. O transfer Manaus–Novo Airão–Manaus não está incluso nos pacotes.',
    en: 'You choose the type of transfer and the Pouso arranges everything: accredited drivers, timings and the boat crossing. The Manaus–Novo Airão–Manaus transfer is not included in the packages.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export async function Intro() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <div className={styles.eyebrow}>{COPY.eyebrow[locale]}</div>
          <h1 className={styles.title}>
            {COPY.titleLine1[locale]}
            <br />
            <em className={styles.em}>{COPY.titleLine2[locale]}</em>
          </h1>
        </div>
        <p className={styles.body}>{COPY.body[locale]}</p>
      </div>
    </section>
  );
}
