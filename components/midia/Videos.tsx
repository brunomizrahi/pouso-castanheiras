import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './Videos.module.css';

// dc.html 1425-1448: "Em vídeo" label + divider line, then a 2-up grid of YouTube link
// cards (16:9 thumbnail + gradient scrim + play badge + headline). The thumbnails come from
// img.youtube.com, which isn't a configured next/image domain, so plain <img> is used —
// same pattern already established in components/home/Imprensa.tsx.
const COPY = {
  label: { pt: 'Em vídeo', en: 'On video' },
} as const satisfies Record<string, Record<Locale, string>>;

const VIDEOS: { id: string; href: string; headline: Record<Locale, string> }[] = [
  {
    id: 'PrzUBa5J218',
    href: 'https://www.youtube.com/watch?v=PrzUBa5J218',
    headline: {
      pt: 'O Pouso das Castanheiras no YouTube',
      en: 'Pouso das Castanheiras on YouTube',
    },
  },
  {
    id: 'eahpnLj0V4I',
    href: 'https://www.youtube.com/watch?v=eahpnLj0V4I',
    headline: {
      pt: 'Hospedagem única na floresta, com Daniela Filomeno',
      en: 'A one-of-a-kind stay in the forest, with Daniela Filomeno',
    },
  },
];

export async function Videos() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>{COPY.label[locale]}</span>
        <span className={styles.line} />
      </div>
      <div className={styles.grid}>
        {VIDEOS.map((video) => (
          <a key={video.id} href={video.href} target="_blank" rel="noopener" className={styles.card}>
            {/* eslint-disable-next-line @next/next/no-img-element -- img.youtube.com isn't a configured next/image domain */}
            <img src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} alt="" className={styles.thumb} />
            <span className={styles.scrim} />
            <span className={styles.content}>
              <span className={styles.playIcon} aria-hidden="true">
                ▶
              </span>
              <span className={styles.headline}>{video.headline[locale]}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
