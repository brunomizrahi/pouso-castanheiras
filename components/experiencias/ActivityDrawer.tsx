'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/lib/types';
import type { Activity } from '@/content/activities';
import styles from './ActivityDrawer.module.css';

// dc.html 1627-1679 (markup) + 2076-2123 (which fields it shows/how it opens & closes).
// Controlled: parent owns which activity (if any) is open.
const LABELS = {
  duration: { pt: 'Duração', en: 'Duration' },
  season: { pt: 'Temporada', en: 'Season' },
  packages: { pt: 'Inclusa em', en: 'Included in' },
  photos: { pt: 'Registros', en: 'Photos' },
  video: { pt: 'Vídeo da atividade', en: 'Activity video' },
  testimonial: { pt: 'Depoimento', en: 'Testimonial' },
  cta: { pt: 'Consultar datas', en: 'Check dates' },
} as const satisfies Record<string, Record<Locale, string>>;

interface ActivityDrawerProps {
  activity: Activity | null;
  onClose: () => void;
}

export function ActivityDrawer({ activity, onClose }: ActivityDrawerProps) {
  const locale = useLocale() as Locale;

  if (!activity) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={activity.t[locale]}>
      <button type="button" onClick={onClose} className={styles.backdrop} aria-label={locale === 'en' ? 'Close' : 'Fechar'} />
      <aside className={styles.drawer}>
        <div className={styles.heroWrap}>
          <Image src={`/${activity.img}`} alt="" fill sizes="min(620px, 100vw)" className={styles.heroImage} />
          <div className={styles.heroScrim} />
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label={locale === 'en' ? 'Close' : 'Fechar'}>
            &#10005;
          </button>
          <div className={styles.heroCaption}>
            <div className={styles.heroMeta}>
              {activity.n} &nbsp;&middot;&nbsp; {activity.dur[locale]}
            </div>
            <h2 className={styles.heroTitle}>{activity.t[locale]}</h2>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.infoStrip}>
            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>{LABELS.duration[locale]}</div>
              <div className={styles.infoValue}>{activity.dur[locale]}</div>
            </div>
            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>{LABELS.season[locale]}</div>
              <div className={styles.infoValue}>{activity.season[locale]}</div>
            </div>
            <div className={`${styles.infoCell} ${styles.infoCellLast}`}>
              <div className={styles.infoLabel}>{LABELS.packages[locale]}</div>
              <div className={styles.infoValue}>{activity.packs[locale]}</div>
            </div>
          </div>

          <p className={styles.body}>{activity.body[locale]}</p>

          <div className={styles.photosLabel}>{LABELS.photos[locale]}</div>
          <div className={styles.photoGrid}>
            <div className={styles.photoCell}>
              <Image src={`/${activity.img}`} alt="" fill sizes="280px" className={styles.photoImage} />
            </div>
            <div className={styles.photoCell}>
              <Image src={`/${activity.img2}`} alt="" fill sizes="280px" className={styles.photoImage} />
            </div>
          </div>
          <div className={styles.videoPlaceholder}>
            <span className={styles.playIcon}>&#9654;</span>
            <span className={styles.videoLabel}>{LABELS.video[locale]}</span>
          </div>

          <div className={styles.testimonial}>
            <div className={styles.testimonialLabel}>{LABELS.testimonial[locale]}</div>
            <blockquote className={styles.quote}>{activity.quote[locale]}</blockquote>
            <div className={styles.quoteBy}>{activity.by}</div>
          </div>

          <Link href="/reserva" onClick={onClose} className={styles.cta}>
            {LABELS.cta[locale]}
          </Link>
        </div>
      </aside>
    </div>
  );
}
