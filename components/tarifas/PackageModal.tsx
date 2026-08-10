'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import { PACKAGES, PRICES } from '@/content/packages';
import { ACTIVITIES } from '@/content/activities';
import { brl } from '@/lib/format';
import styles from './PackageModal.module.css';

// dc.html 1577-1625 (markup) + 2094-2110 (which fields it shows and how pkgActs/pkgSpecial
// are derived). Controlled: parent owns which package index (if any) is open, same shape as
// experiencias/ActivityDrawer.
const LABELS = {
  activitiesIncluded: { pt: 'Atividades inclusas', en: 'Activities included' },
  ratesBySeason: { pt: 'Valores por temporada', en: 'Rates by season' },
  low: { pt: 'Baixa temporada', en: 'Low season' },
  lowCaption: { pt: 'Fev–jun e ago até 26/12', en: 'Feb–Jun and Aug until 26 Dec' },
  high: { pt: 'Alta temporada', en: 'High season' },
  highCaption: { pt: 'Janeiro e julho', en: 'January and July' },
  special: { pt: 'Temporada especial', en: 'Special season' },
  specialCaption: { pt: 'Réveillon e Carnaval', en: 'New Year and Carnival' },
  notApplicable: { pt: 'Não se aplica', en: 'Not available' },
  footnote: {
    pt: 'Valores para uso exclusivo da casa, até 6 pessoas. Transfer Manaus–Novo Airão não incluso.',
    en: 'Rates for exclusive use of the house, up to 6 people. Manaus–Novo Airão transfer not included.',
  },
  cta: { pt: 'Consultar datas para este pacote', en: 'Check dates for this package' },
  close: { pt: 'Fechar', en: 'Close' },
} as const satisfies Record<string, Record<Locale, string>>;

interface PackageModalProps {
  packageIndex: number | null;
  onClose: () => void;
}

export function PackageModal({ packageIndex, onClose }: PackageModalProps) {
  const locale = useLocale() as Locale;

  if (packageIndex === null) return null;

  const pkg = PACKAGES[packageIndex];
  const price = PRICES[packageIndex];
  const activities = pkg.acts.map((i) => ACTIVITIES[i]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={pkg.name[locale]}>
      <button type="button" onClick={onClose} className={styles.backdrop} aria-label={LABELS.close[locale]} />
      <aside className={styles.panel}>
        <div className={styles.heroWrap}>
          <Image src={`/${pkg.img}`} alt="" fill sizes="min(620px, 100vw)" className={styles.heroImage} />
          <div className={styles.heroScrim} />
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label={LABELS.close[locale]}>
            &#10005;
          </button>
          <div className={styles.heroCaption}>
            <div className={styles.heroMeta}>{pkg.meta[locale]}</div>
            <h2 className={styles.heroTitle}>{pkg.name[locale]}</h2>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.body}>{pkg.body[locale]}</p>

          <div className={styles.sectionLabel}>{LABELS.activitiesIncluded[locale]}</div>
          <div className={styles.actsList}>
            {activities.map((activity) => (
              <div key={activity.n} className={styles.actRow}>
                <span className={styles.actNumber}>{activity.n}</span>
                <span className={styles.actTitle}>{activity.t[locale]}</span>
                <span className={styles.actDuration}>{activity.dur[locale]}</span>
              </div>
            ))}
          </div>

          <div className={styles.sectionLabel}>{LABELS.ratesBySeason[locale]}</div>
          <div className={styles.priceBox}>
            <div className={styles.priceRow}>
              <span>
                <span className={styles.priceLabel}>{LABELS.low[locale]}</span>
                <span className={styles.priceCaption}>{LABELS.lowCaption[locale]}</span>
              </span>
              <span className={styles.priceValue}>{brl(price.low)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>
                <span className={styles.priceLabel}>{LABELS.high[locale]}</span>
                <span className={styles.priceCaption}>{LABELS.highCaption[locale]}</span>
              </span>
              <span className={styles.priceValue}>{brl(price.high)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>
                <span className={styles.priceLabel}>{LABELS.special[locale]}</span>
                <span className={styles.priceCaption}>{LABELS.specialCaption[locale]}</span>
              </span>
              <span className={styles.priceValue}>
                {price.special === null ? LABELS.notApplicable[locale] : brl(price.special)}
              </span>
            </div>
          </div>
          <p className={styles.footnote}>{LABELS.footnote[locale]}</p>

          <Link href="/reserva" onClick={onClose} className={styles.cta}>
            {LABELS.cta[locale]}
          </Link>
        </div>
      </aside>
    </div>
  );
}
