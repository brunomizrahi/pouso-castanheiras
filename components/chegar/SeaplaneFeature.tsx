import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './SeaplaneFeature.module.css';

// dc.html 802-835: dark textured section, badge + h2 + copy + stats row on the left,
// the /video/hidroaviao.mp4 clip on the right. Native controls, no autoplay (README).
const COPY = {
  badge: { pt: 'A chegada mais bonita', en: 'The most beautiful arrival' },
  titleLine1: { pt: 'De hidroavião,', en: 'By seaplane,' },
  titleLine2: { pt: 'direto ao píer', en: 'straight to the pier' },
  body: {
    pt: 'Quarenta minutos sobrevoando o encontro das águas, o arquipélago de Anavilhanas e os igarapés do Rio Negro. O avião pousa no rio e atraca no nosso píer, sem traslado terrestre e sem travessia de barco.',
    en: 'Forty minutes flying over the meeting of the waters, the Anavilhanas archipelago and the creeks of the Rio Negro. The plane lands on the river and docks at our pier, with no road transfer and no boat crossing.',
  },
  caption: {
    pt: 'Pouso no Rio Negro, no píer do Pouso.',
    en: 'Landing on the Rio Negro, at the Pouso’s pier.',
  },
} as const satisfies Record<string, Record<Locale, string>>;

const STATS: { value: string; label: Record<Locale, string> }[] = [
  { value: '40 min', label: { pt: 'Manaus → píer', en: 'Manaus → pier' } },
  { value: '8', label: { pt: 'passageiros', en: 'passengers' } },
  { value: 'R$ 11.000', label: { pt: 'cada trecho', en: 'each way' } },
];

export async function SeaplaneFeature() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div aria-hidden="true" className={styles.texture} />
      <div aria-hidden="true" className={styles.vignette} />
      <div className={styles.inner}>
        <div>
          <div className={styles.badge}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sand)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12l20-6-6 20-3.5-8.5L2 12Z" />
              <path d="M3 20h18" />
            </svg>
            <span>{COPY.badge[locale]}</span>
          </div>
          <h2 className={styles.title}>
            {COPY.titleLine1[locale]}
            <br />
            <em className={styles.em}>{COPY.titleLine2[locale]}</em>
          </h2>
          <p className={styles.body}>{COPY.body[locale]}</p>
          <div className={styles.stats}>
            {STATS.map((stat) => (
              <div key={stat.label.en} className={styles.stat}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label[locale]}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={styles.videoWrap}>
            <video src="/video/hidroaviao.mp4" controls preload="metadata" playsInline className={styles.video} />
          </div>
          <p className={styles.videoCaption}>{COPY.caption[locale]}</p>
        </div>
      </div>
    </section>
  );
}
