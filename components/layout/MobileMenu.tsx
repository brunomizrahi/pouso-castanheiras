'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './MobileMenu.module.css';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/a-casa', key: 'casa' },
  { href: '/experiencias', key: 'experiencias' },
  { href: '/como-chegar', key: 'chegar' },
  { href: '/tarifas', key: 'tarifas' },
  { href: '/midia', key: 'midia' },
] as const;

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div id="pc-menu" data-open={open} className={styles.menu} onClick={onClose}>
      <button type="button" className={styles.close} aria-label="Fechar menu" onClick={onClose}>
        ✕
      </button>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.link} onClick={onClose}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <Link href="/reserva" className={styles.cta} onClick={onClose}>
          {t('header.cta')}
        </Link>
        <a href="https://wa.me/5511942995588" className={styles.whatsapp}>
          {t('header.whatsapp')}
        </a>
        <Link
          href={locale === 'pt' ? '/en' : '/'}
          locale={locale === 'pt' ? 'en' : 'pt'}
          className={styles.langToggle}
        >
          {locale === 'pt' ? 'EN' : 'PT'}
        </Link>
      </div>
    </div>
  );
}
