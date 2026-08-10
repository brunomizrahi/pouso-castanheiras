import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './ChamadaFinal.module.css';

const COPY = {
  titleLine1: { pt: 'A casa recebe', en: 'The house hosts' },
  titleLine2: { pt: 'um grupo por vez.', en: 'one group at a time.' },
  body: {
    pt: 'Conte para nós quando você quer vir. Respondemos no WhatsApp em poucas horas.',
    en: 'Tell us when you would like to come. We reply on WhatsApp within a few hours.',
  },
  cta: { pt: 'Consultar datas', en: 'Check dates' },
  alt: { pt: 'Pôr do sol na praia', en: 'Sunset on the beach' },
} as const;

export async function ChamadaFinal() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <Image src="/img/a24-1.jpg" alt={COPY.alt[locale]} fill sizes="100vw" className={styles.photo} priority={false} />
      <div className={styles.scrim} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {COPY.titleLine1[locale]}
            <br />
            {COPY.titleLine2[locale]}
          </h2>
          <p className={styles.body}>{COPY.body[locale]}</p>
          <div className={styles.actions}>
            <Link href="/reserva" className={styles.primaryCta}>
              {COPY.cta[locale]}
            </Link>
            <a href="https://wa.me/5511942995588" target="_blank" rel="noopener" className={styles.whatsapp}>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
