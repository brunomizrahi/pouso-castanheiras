import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import { TransferPlaceholder } from './TransferPlaceholder';
import styles from './TransferOptions.module.css';

// dc.html 837-889: label + h2 + note, then 3 cards (táxi, van, hidroavião — the last one
// dark). Each card's image slot uses a real photo when one exists in public/img/, or
// TransferPlaceholder otherwise. All 3 are still missing (README "Faltando"), so `photo`
// is undefined for every entry today — this keeps the swap to a real photo a one-line change.
const COPY = {
  label: { pt: 'Modalidades de transfer', en: 'Transfer options' },
  title: { pt: 'Escolha como quer chegar', en: 'Choose how you arrive' },
  note: {
    pt: 'Valores de 2026. Não entram nos pacotes, mas nós cuidamos da reserva para você.',
    en: '2026 rates. Not included in the packages, but we handle the booking for you.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const TRANSFERS: {
  key: string;
  photo?: string;
  dark?: boolean;
  category: Record<Locale, string>;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  price: string;
  priceNote: Record<Locale, string>;
}[] = [
  {
    key: 'taxi',
    category: { pt: 'Rodoviário', en: 'By road' },
    title: { pt: 'Táxi da cooperativa', en: 'Cooperative taxi' },
    desc: {
      pt: 'Cooperativa de Novo Airão, até 4 passageiros por carro.',
      en: 'Novo Airão cooperative, up to 4 passengers per car.',
    },
    price: 'R$ 1.100',
    priceNote: { pt: 'ida e volta  ·  2h45 cada trecho', en: 'round trip  ·  2h45 each way' },
  },
  {
    key: 'van',
    category: { pt: 'Rodoviário', en: 'By road' },
    title: { pt: 'Van executiva', en: 'Executive van' },
    desc: {
      pt: 'Até 8 passageiros, com espaço para a bagagem do grupo completo.',
      en: 'Up to 8 passengers, with room for the whole group’s luggage.',
    },
    price: 'R$ 1.300',
    priceNote: { pt: 'cada trecho  ·  2h45', en: 'each way  ·  2h45' },
  },
  {
    key: 'hidro',
    dark: true,
    category: { pt: 'Aéreo', en: 'By air' },
    title: { pt: 'Hidroavião', en: 'Seaplane' },
    desc: {
      pt: 'Até 8 passageiros. Pousa no rio e atraca no píer do Pouso.',
      en: 'Up to 8 passengers. Lands on the river and docks at our pier.',
    },
    price: 'R$ 11.000',
    priceNote: { pt: 'cada trecho  ·  40 min', en: 'each way  ·  40 min' },
  },
];

export async function TransferOptions() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.label}>{COPY.label[locale]}</div>
          <h2 className={styles.title}>{COPY.title[locale]}</h2>
        </div>
        <p className={styles.note}>{COPY.note[locale]}</p>
      </div>
      <div className={styles.grid}>
        {TRANSFERS.map((t) => (
          <div key={t.key} className={`${styles.card} ${t.dark ? styles.cardDark : ''}`}>
            <div className={styles.imageWrap}>
              {t.photo ? (
                <Image src={t.photo} alt={t.title[locale]} fill sizes="(max-width: 760px) 100vw, 33vw" className={styles.image} />
              ) : (
                <TransferPlaceholder />
              )}
            </div>
            <div className={styles.body}>
              <span className={`${styles.category} ${t.dark ? styles.categoryDark : ''}`}>{t.category[locale]}</span>
              <h3 className={styles.cardTitle}>{t.title[locale]}</h3>
              <p className={`${styles.desc} ${t.dark ? styles.descDark : ''}`}>{t.desc[locale]}</p>
              <div className={`${styles.priceBox} ${t.dark ? styles.priceBoxDark : ''}`}>
                <div className={styles.price}>{t.price}</div>
                <div className={`${styles.priceNote} ${t.dark ? styles.priceNoteDark : ''}`}>{t.priceNote[locale]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
