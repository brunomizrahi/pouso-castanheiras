import { getLocale } from 'next-intl/server';
import type { Locale } from '@/lib/types';
import styles from './TransferPlaceholder.module.css';

// Replaces the prototype's <image-slot> custom element (design-source/image-slot.js —
// not part of support.js, not portable to production) for the 3 transfer photos still
// missing from public/img/: táxi da cooperativa, van executiva and hidroavião parado
// (README.md "Faltando"). A sand-bordered box with a camera icon, sized to fill its
// parent's image slot (the parent sets position: relative + an explicit height).
const CAPTION = { pt: 'Foto em breve', en: 'Photo coming soon' } as const satisfies Record<Locale, string>;

export async function TransferPlaceholder() {
  const locale = (await getLocale()) as Locale;

  return (
    <div className={styles.placeholder}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={styles.icon}
      >
        <path d="M4 8h3l1.6-2.4A1.5 1.5 0 0 1 9.86 5h4.28a1.5 1.5 0 0 1 1.26.6L17 8h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8Z" />
        <circle cx="12" cy="13.4" r="3.6" />
        <path d="M12 9.4v-2M10.5 7.4h3" />
      </svg>
      <span className={styles.caption}>{CAPTION[locale]}</span>
    </div>
  );
}
