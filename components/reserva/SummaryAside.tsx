'use client';

import { useLocale } from 'next-intl';
import { fmtBr } from '@/lib/format';
import { TRANSFER_LABELS, type TransferKey } from '@/content/transfers';
import type { Season } from '@/lib/season';
import type { Locale } from '@/lib/types';
import styles from './SummaryAside.module.css';

// dc.html 1363-1396: sticky aside — check-in/check-out pair, a 4-row summary (nights, package,
// guests, transfer), the price block, the <pre> message preview and the wa.me send button.
// dc.html's `reservaVals()` also computes a `sumSeason` state key, but it is never referenced
// anywhere in this template (1363-1396) — the season isn't shown in the aside in the source
// either, so the `season` prop here is accepted (page.tsx passes it, per the plan's Step 5
// wiring) but intentionally unused in the markup, matching dc.html's own behavior.
const LABELS = {
  summary: { pt: 'Resumo', en: 'Summary' },
  checkIn: { pt: 'Check-in', en: 'Check-in' },
  select: { pt: 'Selecione', en: 'Select' },
  nights: { pt: 'Noites', en: 'Nights' },
  package: { pt: 'Pacote', en: 'Package' },
  guests: { pt: 'Hóspedes', en: 'Guests' },
  of6: { pt: 'de 6', en: 'of 6' },
  investment: { pt: 'Investimento', en: 'Investment' },
  messageLabel: { pt: 'Mensagem que será enviada', en: 'Message we will send' },
  send: { pt: 'Enviar no WhatsApp', en: 'Send on WhatsApp' },
  footnote: {
    pt: 'Confirmação mediante sinal de 50%. Saldo até 15 dias antes do check-in.',
    en: 'Confirmed with a 50% deposit. Balance due 15 days before check-in.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

interface SummaryAsideProps {
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  packageName: string;
  season: Season | null;
  pax: string;
  transfer: TransferKey;
  price: string;
  priceNote: string;
  message: string;
  whatsappLink: string;
}

export function SummaryAside({
  checkIn,
  checkOut,
  nights,
  packageName,
  pax,
  transfer,
  price,
  priceNote,
  message,
  whatsappLink,
}: SummaryAsideProps) {
  const locale = useLocale() as Locale;

  return (
    <aside className={styles.aside}>
      <div className={styles.top}>
        <div className={styles.label}>{LABELS.summary[locale]}</div>
        <div className={styles.dates}>
          <div className={styles.dateCol}>
            <div className={styles.dateLabel}>{LABELS.checkIn[locale]}</div>
            <div className={styles.dateValue}>{checkIn ? fmtBr(checkIn) : LABELS.select[locale]}</div>
          </div>
          <div className={`${styles.dateCol} ${styles.dateColRight}`}>
            <div className={styles.dateLabel}>Check-out</div>
            <div className={styles.dateValue}>{checkOut ? fmtBr(checkOut) : LABELS.select[locale]}</div>
          </div>
        </div>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{LABELS.nights[locale]}</span>
            <span>{nights}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{LABELS.package[locale]}</span>
            <span className={styles.rowValueRight}>{packageName}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{LABELS.guests[locale]}</span>
            <span>
              {pax} {LABELS.of6[locale]}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Transfer</span>
            <span className={styles.rowValueRight}>{TRANSFER_LABELS[transfer][locale]}</span>
          </div>
        </div>
      </div>
      <div className={styles.priceBox}>
        <div className={styles.priceLabel}>{LABELS.investment[locale]}</div>
        <div className={styles.price}>{price}</div>
        <p className={styles.priceNote}>{priceNote}</p>
      </div>
      <div className={styles.messageBox}>
        <div className={styles.messageLabel}>{LABELS.messageLabel[locale]}</div>
        <pre className={styles.pre}>{message}</pre>
        <a href={whatsappLink} target="_blank" rel="noopener" className={styles.cta}>
          {LABELS.send[locale]}
        </a>
        <p className={styles.footnote}>{LABELS.footnote[locale]}</p>
      </div>
    </aside>
  );
}
