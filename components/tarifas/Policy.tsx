'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import styles from './Policy.module.css';

// dc.html 1189-1226: label + a three-column bordered grid (Confirmação / Cancelamento /
// Remarcação) and a closing pair of CTAs (goReserva -> /reserva, WhatsApp link). The two
// "Remarcação" paragraphs have no data-en in the source (only their <strong> lead-ins do —
// "Temporada Regular:" / "Alta e Especial:") — translated here to keep the page bilingual,
// same approach used for RouteMap's legend and the A Casa team paragraph.
const LABEL = { pt: 'Política de reservas e cancelamento', en: 'Booking & cancellation policy' } as const satisfies Record<
  Locale,
  string
>;

const CONFIRMATION = {
  title: { pt: 'Confirmação', en: 'Confirmation' },
  p1: {
    pt: 'A reserva é confirmada mediante o pagamento de um sinal de 50%.',
    en: 'The booking is confirmed on payment of a 50% deposit.',
  },
  p2: {
    pt: 'O saldo restante de 50% deve ser pago até 15 dias antes da data de check-in.',
    en: 'The remaining 50% is due up to 15 days before the check-in date.',
  },
  footnote: {
    pt: 'Check-in 12h · Check-out 12h. Não trabalhamos com entrada e saída de grupos distintos no mesmo dia.',
    en: 'Check-in 12pm · Check-out 12pm. We do not host arrivals and departures of different groups on the same day.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const CANCELLATION = {
  title: { pt: 'Cancelamento', en: 'Cancellation' },
  rows: [
    {
      period: { pt: '30 dias ou mais antes', en: '30 days or more before' },
      terms: {
        pt: 'Regular: reembolso de 100% do sinal · Alta: 50% · Especial: 25%',
        en: 'Regular: 100% of the deposit refunded · High: 50% · Special: 25%',
      },
    },
    {
      period: { pt: 'Entre 29 e 15 dias antes', en: 'Between 29 and 15 days before' },
      terms: {
        pt: 'Regular: reembolso de 50% do sinal · Alta: 15% · Especial: não reembolsável',
        en: 'Regular: 50% of the deposit refunded · High: 15% · Special: non-refundable',
      },
    },
    {
      period: { pt: '15 dias ou menos', en: '15 days or less' },
      terms: { pt: 'Não reembolsável', en: 'Non-refundable' },
    },
  ],
} as const satisfies { title: Record<Locale, string>; rows: { period: Record<Locale, string>; terms: Record<Locale, string> }[] };

const RESCHEDULING = {
  title: { pt: 'Remarcação', en: 'Rescheduling' },
  intro: {
    pt: 'Em caso de força maior e necessidade de remarcação de datas, sujeito à disponibilidade:',
    en: 'In case of force majeure and a need to reschedule dates, subject to availability:',
  },
  regularLabel: { pt: 'Temporada Regular:', en: 'Regular season:' },
  regularBody: {
    pt: 'serão usados como parâmetro os valores vigentes para a nova data.',
    en: 'the rates in effect for the new date will be used as the reference.',
  },
  highSpecialLabel: { pt: 'Alta e Especial:', en: 'High and Special:' },
  highSpecialBody: {
    pt: 'serão usados os valores das tarifas originais, acrescidos de atualização em caso de remarcação para o ano-calendário seguinte.',
    en: 'the original rates will be used, with an adjustment applied if the rescheduled date falls in the following calendar year.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const ACTIONS = {
  checkDates: { pt: 'Consultar datas', en: 'Check dates' },
  whatsapp: { pt: 'Falar no WhatsApp', en: 'Message us on WhatsApp' },
} as const satisfies Record<string, Record<Locale, string>>;

export function Policy() {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.label}>{LABEL[locale]}</div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{CONFIRMATION.title[locale]}</h3>
          <p className={styles.p}>{CONFIRMATION.p1[locale]}</p>
          <p className={styles.p}>{CONFIRMATION.p2[locale]}</p>
          <p className={styles.footnote}>{CONFIRMATION.footnote[locale]}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{CANCELLATION.title[locale]}</h3>
          <div className={styles.cancelList}>
            {CANCELLATION.rows.map((row) => (
              <div key={row.period.en}>
                <div className={styles.cancelPeriod}>{row.period[locale]}</div>
                <span>{row.terms[locale]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{RESCHEDULING.title[locale]}</h3>
          <p className={styles.p}>{RESCHEDULING.intro[locale]}</p>
          <p className={styles.pSmall}>
            <strong className={styles.strong}>{RESCHEDULING.regularLabel[locale]}</strong> {RESCHEDULING.regularBody[locale]}
          </p>
          <p className={styles.pSmall}>
            <strong className={styles.strong}>{RESCHEDULING.highSpecialLabel[locale]}</strong>{' '}
            {RESCHEDULING.highSpecialBody[locale]}
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <Link href="/reserva" className={styles.primaryCta}>
          {ACTIONS.checkDates[locale]}
        </Link>
        <a href="https://wa.me/5511942995588" target="_blank" rel="noopener" className={styles.secondaryCta}>
          {ACTIONS.whatsapp[locale]}
        </a>
      </div>
    </section>
  );
}
