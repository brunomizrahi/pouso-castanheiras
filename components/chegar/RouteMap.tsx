import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './RouteMap.module.css';

// dc.html 755-764: bordered/rounded wrapper around the iframe (public/route-map.html,
// Task 3 — a self-contained Leaflet/OpenStreetMap page, no API key needed), plus a
// legend row explaining the three route-type line styles drawn on the map. The legend
// text has no data-en in the source (PT-only in the prototype); translated here to
// keep the page bilingual, same approach used for the untranslated Team paragraph on
// the A Casa page.
const LEGEND: { swatch: 'dotted' | 'dashed' | 'solid'; label: Record<Locale, string> }[] = [
  { swatch: 'dotted', label: { pt: 'Rodoviário BR-174 / AM-352', en: 'By road, BR-174 / AM-352' } },
  { swatch: 'dashed', label: { pt: 'Hidroavião, direto ao píer', en: 'Seaplane, direct to the pier' } },
  { swatch: 'solid', label: { pt: 'Travessia de barco, 15 min', en: 'Boat crossing, 15 min' } },
];

export async function RouteMap() {
  const locale = (await getLocale()) as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <iframe
          src="/route-map.html"
          title="Mapa do trajeto Manaus–Novo Airão–Pouso das Castanheiras"
          className={styles.iframe}
        />
      </div>
      <div className={styles.legend}>
        {LEGEND.map((item) => (
          <span key={item.swatch} className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles[item.swatch]}`} />
            {item.label[locale]}
          </span>
        ))}
      </div>
    </section>
  );
}
