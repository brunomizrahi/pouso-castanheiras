import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Depoimentos.module.css';

const COPY = {
  label: { pt: 'Nossos hóspedes', en: 'Our guests' },
  featured: {
    quote: {
      pt: 'Se a Amazônia é o paraíso dos mistérios, o Pouso é o próprio portal.',
      en: 'If the Amazon is the paradise of mysteries, the Pouso is the gateway itself.',
    },
    by: 'Marcus Ozi',
  },
  photoAlt: { pt: 'Hóspedes ao pôr do sol na praia', en: 'Guests at sunset on the beach' },
} as const;

const TESTIMONIALS = [
  {
    quote: {
      pt: 'Minha família e eu passamos dias neste refúgio de paz (...) Uma verdadeira experiência de imersão na Amazônia. À noite você pode desfrutar do show sonoro único da floresta.',
      en: 'My family and I spent days in this refuge of peace (...) A true experience of immersion in the Amazon. At night you can enjoy the forest’s unique sound show.',
    },
    by: { pt: 'Tom Rera e família', en: 'Tom Rera and family' },
    variant: 'outline' as const,
  },
  {
    quote: {
      pt: 'Muito amor por toda parte (...) O Pouso prometeu e entregou tudo.',
      en: 'Love everywhere you look (...) The Pouso promised and delivered everything.',
    },
    by: { pt: 'Ana Carolina Srougi e família Soares', en: 'Ana Carolina Srougi and the Soares family' },
    variant: 'sand' as const,
  },
  {
    quote: {
      pt: 'O pessoal muito acolhedor, a comida super gostosa, e a descoberta de alimentos típicos da região foram um sucesso total. Com certeza voltaremos no futuro.',
      en: 'Such a welcoming team, delicious food, and discovering the region’s typical ingredients was a complete success. We will certainly return.',
    },
    by: { pt: 'Bruna Constantino e família', en: 'Bruna Constantino and family' },
    variant: 'outline' as const,
  },
] as const;

function QuoteIcon() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden="true">
      <path
        d="M0 24V13.2C0 5.9 4.2 1.4 12 0l1.2 4.3C8.6 5.6 6.3 8.1 6.3 11.4h5.4V24H0Zm18 0V13.2C18 5.9 22.2 1.4 30 0l1.2 4.3c-4.6 1.3-6.9 3.8-6.9 7.1h5.4V24H18Z"
        fill="var(--olive)"
      />
    </svg>
  );
}

export async function Depoimentos() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.label}>{COPY.label[locale]}</div>
      <div className={styles.grid}>
        <figure className={styles.featured}>
          <QuoteIcon />
          <div>
            <blockquote className={styles.featuredQuote}>{COPY.featured.quote[locale]}</blockquote>
            <figcaption className={styles.featuredBy}>{COPY.featured.by}</figcaption>
          </div>
        </figure>
        <div className={styles.photoCell}>
          <Image src="/img/por-do-sol-praia.jpg" alt={COPY.photoAlt[locale]} fill sizes="(max-width: 900px) 100vw, 40vw" className={styles.photo} />
        </div>
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.by.pt}
            className={`${styles.testimonial} ${testimonial.variant === 'sand' ? styles.testimonialSand : styles.testimonialOutline}`}
          >
            <blockquote className={styles.testimonialQuote}>{testimonial.quote[locale]}</blockquote>
            <figcaption className={styles.testimonialBy}>{testimonial.by[locale]}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
