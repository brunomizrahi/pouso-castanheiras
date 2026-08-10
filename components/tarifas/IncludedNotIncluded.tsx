'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import styles from './IncludedNotIncluded.module.css';

// dc.html 1166-1187: sand-bg section, two columns of bulleted lines.
const LABELS = {
  included: { pt: "O que está incluso", en: "What's included" },
  notIncluded: { pt: 'O que não está incluso', en: "What's not included" },
} as const satisfies Record<string, Record<Locale, string>>;

const INCLUDED = [
  {
    pt: 'Estadia para uso exclusivo da casa para até 6 pessoas, com serviço.',
    en: 'Exclusive use of the house for up to 6 people, with service.',
  },
  {
    pt: 'Pensão completa: café da manhã, almoço e jantar.',
    en: 'Full board: breakfast, lunch and dinner.',
  },
  {
    pt: 'Atividades, passeios e experiências conforme descritos nos pacotes.',
    en: 'Activities, excursions and experiences as described in each package.',
  },
  {
    pt: 'Serviço de camareira e bebidas não alcoólicas.',
    en: 'Housekeeping and non-alcoholic drinks.',
  },
] as const satisfies Record<Locale, string>[];

const NOT_INCLUDED = [
  {
    pt: 'Transfer Manaus–Novo Airão–Manaus. O hóspede escolhe a modalidade e o Pouso organiza tudo.',
    en: 'Manaus–Novo Airão–Manaus transfer. You choose the type and the Pouso arranges everything.',
  },
  {
    pt: 'Bebidas alcoólicas, cobradas à parte.',
    en: 'Alcoholic drinks, charged separately.',
  },
  {
    pt: 'Intérprete em inglês: R$ 350,00 por diária.',
    en: 'English interpreter: R$ 350.00 per day.',
  },
  {
    pt: 'Camas extras, exclusivas para crianças: até 5 anos gratuito; entre 6 e 12 anos, +10% do valor do pacote por cama.',
    en: 'Extra beds, for children only: free up to age 5; ages 6 to 12, +10% of the package price per bed.',
  },
] as const satisfies Record<Locale, string>[];

export function IncludedNotIncluded() {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <div className={styles.label}>{LABELS.included[locale]}</div>
          <div className={styles.list}>
            {INCLUDED.map((item) => (
              <div key={item.en} className={styles.item}>
                <span className={`${styles.bullet} ${styles.bulletIncluded}`}>·</span>
                <span>{item[locale]}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={styles.label}>{LABELS.notIncluded[locale]}</div>
          <div className={styles.list}>
            {NOT_INCLUDED.map((item) => (
              <div key={item.en} className={styles.item}>
                <span className={`${styles.bullet} ${styles.bulletExcluded}`}>·</span>
                <span>{item[locale]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
