'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './CtaBanner.module.css';

// dc.html 728-739: sand-bg banner, title + copy on the left, two pill buttons on the right
// (goTarifas -> /tarifas, goReserva -> /reserva). Client component for the same reason as Intro.
const COPY = {
  title: {
    pt: 'Quais atividades entram no meu pacote?',
    en: 'Which activities are in my package?',
  },
  body: {
    pt: 'É o número de noites que define quantas experiências entram. Compare os quatro pacotes e os valores de cada temporada.',
    en: 'The number of nights defines how many experiences are included. Compare the four packages and the rates for each season.',
  },
  packagesCta: { pt: 'Ver pacotes e tarifas', en: 'See packages and rates' },
  datesCta: { pt: 'Consultar datas', en: 'Check dates' },
} as const satisfies Record<string, Record<Locale, string>>;

export function CtaBanner() {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <h2 className={styles.title}>{COPY.title[locale]}</h2>
          <p className={styles.body}>{COPY.body[locale]}</p>
        </div>
        <div className={styles.actions}>
          <Link href="/tarifas" className={styles.primaryCta}>
            {COPY.packagesCta[locale]}
          </Link>
          <Link href="/reserva" className={styles.secondaryCta}>
            {COPY.datesCta[locale]}
          </Link>
        </div>
      </div>
    </section>
  );
}
