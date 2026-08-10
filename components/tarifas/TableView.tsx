'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/types';
import { PACKAGES, PRICES } from '@/content/packages';
import { ACTIVITIES } from '@/content/activities';
import { brl } from '@/lib/format';
import styles from './TableView.module.css';

// dc.html 972-1084: the "Comparar" table. Four package columns (Rio Negro, Macucus, Ajuricaba
// — highlighted, Pouso), reading names from PACKAGES and prices from PRICES (both Task 10).
// The per-column "N noites" captions and the row labels/●·marks aren't stored fields on
// PackageContent/Activity — they're derived here from ACTIVITIES text plus each package's
// `acts` index list, and the small amount of table-only copy (season captions, the "época de
// seca"/"ou ..." row suffixes, the legend) is transcribed verbatim from dc.html.
const COL_META: Record<Locale, string>[] = [
  { pt: '3 noites', en: '3 nights' },
  { pt: '4 noites', en: '4 nights' },
  { pt: '5 noites · sugerido', en: '5 nights · suggested' },
  { pt: 'Por diária', en: 'Per night' },
];
const HIGHLIGHT_COL = 2; // Ajuricaba

// Table rows in dc.html order. Each maps to one (or, for the "ou" row, two) ACTIVITIES
// indices; a package's column gets a ● if any of the row's activity indices appear in that
// package's `acts` array.
const ROWS: { acts: number[]; suffix?: Record<Locale, string> }[] = [
  { acts: [0] },
  { acts: [1] },
  { acts: [2], suffix: { pt: '(época de seca)', en: '(dry season)' } },
  { acts: [3] },
  { acts: [4] },
  { acts: [5] },
  { acts: [6, 7] },
  { acts: [8] },
];

const SEASON_ROWS: { key: string; label: Record<Locale, string>; values: (number | null)[] }[] = [
  { key: 'low', label: { pt: 'Baixa temporada', en: 'Low season' }, values: PRICES.map((p) => p.low) },
  { key: 'high', label: { pt: 'Alta temporada', en: 'High season' }, values: PRICES.map((p) => p.high) },
  { key: 'special', label: { pt: 'Temporada especial', en: 'Special season' }, values: PRICES.map((p) => p.special) },
];

const NOT_APPLICABLE = { pt: 'Não se aplica', en: 'Not available' } as const satisfies Record<Locale, string>;
const PER_NIGHT = { pt: ' /diária', en: ' /night' } as const satisfies Record<Locale, string>;
const OR_WORD = { pt: 'ou ', en: 'or ' } as const satisfies Record<Locale, string>;

const LEGEND = [
  {
    title: { pt: 'Baixa temporada', en: 'Low season' },
    body: {
      pt: 'De fevereiro a junho e de agosto até 26 de dezembro. Mínimo de 2 diárias no Pacote Pouso, excluindo feriados.',
      en: 'February to June and August until 26 December. Minimum of 2 nights on the Pouso package, excluding holidays.',
    },
  },
  {
    title: { pt: 'Alta temporada', en: 'High season' },
    body: {
      pt: 'Durante os meses de janeiro e julho. Mínimo de 3 diárias no Pacote Pouso.',
      en: 'During January and July. Minimum of 3 nights on the Pouso package.',
    },
  },
  {
    title: { pt: 'Temporada especial', en: 'Special season' },
    body: {
      pt: 'Réveillon de 27/12 a 05/01 e Carnaval de 13/02 a 18/03. Mínimo de 4 diárias no Pacote Pouso.',
      en: "New Year's from 27/12 to 05/01 and Carnival from 13/02 to 18/03. Minimum of 4 nights on the Pouso package.",
    },
  },
] as const satisfies { title: Record<Locale, string>; body: Record<Locale, string> }[];

export function TableView() {
  const locale = useLocale() as Locale;

  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thActivity}>{locale === 'en' ? 'Activities included' : 'Atividades inclusas'}</th>
              {PACKAGES.map((pkg, i) => (
                <th key={pkg.name.en} className={`${styles.thPkg} ${i === HIGHLIGHT_COL ? styles.thPkgHighlight : ''}`}>
                  <div className={styles.thMeta}>{COL_META[i][locale]}</div>
                  <div className={styles.thName}>{pkg.name[locale]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => {
              const label = ACTIVITIES[row.acts[0]].t[locale];
              const comboSuffix = row.acts.length === 2 ? OR_WORD[locale] + ACTIVITIES[row.acts[1]].t[locale] : null;
              const isLast = ri === ROWS.length - 1;
              return (
                <tr key={row.acts.join('-')} className={isLast ? styles.rowLastActivity : undefined}>
                  <td className={styles.tdActivity}>
                    {label}
                    {row.suffix && <span className={styles.tdActivitySuffix}> {row.suffix[locale]}</span>}
                    {comboSuffix && <span className={styles.tdActivitySuffix}> {comboSuffix}</span>}
                  </td>
                  {PACKAGES.map((pkg, ci) => {
                    const included = row.acts.some((a) => pkg.acts.includes(a));
                    return (
                      <td
                        key={pkg.name.en}
                        className={`${styles.tdMark} ${included ? '' : styles.tdMarkOff} ${
                          ci === HIGHLIGHT_COL ? styles.tdMarkHighlight : ''
                        }`}
                      >
                        {included ? '●' : '·'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {SEASON_ROWS.map((row, ri) => {
              const rowClass =
                ri === 0 ? styles.rowSeasonFirst : ri === SEASON_ROWS.length - 1 ? styles.rowSeasonLast : styles.rowSeasonMid;
              return (
                <tr key={row.key} className={rowClass}>
                  <td className={styles.tdSeasonLabel}>{row.label[locale]}</td>
                  {row.values.map((value, ci) => (
                    <td
                      key={ci}
                      className={`${styles.tdPrice} ${ci === HIGHLIGHT_COL ? styles.tdPriceHighlight : ''} ${
                        value === null ? styles.tdPriceNa : ''
                      }`}
                    >
                      {value === null ? (
                        NOT_APPLICABLE[locale]
                      ) : (
                        <>
                          {brl(value)}
                          {ci === 3 && <span className={styles.perNight}>{PER_NIGHT[locale]}</span>}
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.legend}>
        {LEGEND.map((item) => (
          <div key={item.title.en}>
            <strong className={styles.legendTitle}>{item.title[locale]}</strong>
            {item.body[locale]}
          </div>
        ))}
      </div>
    </section>
  );
}
