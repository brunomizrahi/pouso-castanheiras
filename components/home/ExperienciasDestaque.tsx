import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './ExperienciasDestaque.module.css';

const COPY = {
  label: { pt: 'Experiências', en: 'Experiences' },
  title: {
    pt: 'Nove atividades, todas conduzidas por quem vive aqui.',
    en: 'Nine activities, all led by the people who live here.',
  },
  seeAll: { pt: 'Ver todas', en: 'See all' },
} as const;

const HIGHLIGHTS = [
  {
    img: '/img/trilha-castanheira.jpg',
    meta: { pt: '01 · 2h', en: '01 · 2h' },
    title: { pt: 'Trilha na mata e Agrofloresta', en: 'Forest trail and agroforestry' },
  },
  {
    img: '/img/focagem-noturna.jpg',
    meta: { pt: '04 · 3h', en: '04 · 3h' },
    title: { pt: 'Pôr do Sol e Focagem Noturna', en: 'Sunset and night spotting' },
  },
  {
    img: '/img/a17-1.jpg',
    meta: { pt: '05 · 3–4h', en: '05 · 3–4h' },
    title: { pt: 'Arquipélago de Anavilhanas', en: 'Anavilhanas archipelago' },
  },
  {
    img: '/img/grutas-madada.jpg',
    meta: { pt: '09 · 5h', en: '09 · 5h' },
    title: { pt: 'Grutas do Madadá', en: 'Madadá caves' },
  },
] as const;

export async function ExperienciasDestaque() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.label}>{COPY.label[locale]}</div>
            <h2 className={styles.title}>{COPY.title[locale]}</h2>
          </div>
          <Link href="/experiencias" className={styles.seeAll}>
            {COPY.seeAll[locale]}
          </Link>
        </div>
        <div className={styles.grid}>
          {HIGHLIGHTS.map((item) => (
            <Link key={item.img} href="/experiencias" className={styles.card}>
              <div className={styles.imageWrap}>
                <Image src={item.img} alt="" fill sizes="(max-width: 900px) 50vw, 25vw" className={styles.image} />
              </div>
              <div className={styles.meta}>{item.meta[locale]}</div>
              <h3 className={styles.cardTitle}>{item.title[locale]}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
