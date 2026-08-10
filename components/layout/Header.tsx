'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { computeHeaderAppearance } from '@/lib/headerAppearance';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/a-casa', key: 'casa' },
  { href: '/experiencias', key: 'experiencias' },
  { href: '/como-chegar', key: 'chegar' },
  { href: '/tarifas', key: 'tarifas' },
  { href: '/midia', key: 'midia' },
] as const;

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [appearance, setAppearance] = useState(() =>
    computeHeaderAppearance({ scrollY: 0, heroBottom: null })
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const hero = document.querySelector<HTMLElement>('[data-dark-hero]');
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : null;
      setAppearance(computeHeaderAppearance({ scrollY: window.scrollY, heroBottom }));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <>
      <header
        id="pc-header"
        className={styles.header}
        style={{
          background: appearance.background,
          backdropFilter: appearance.backdropFilter,
          boxShadow: appearance.boxShadow,
          color: appearance.ink,
        }}
      >
        <Link href="/" className={styles.brand}>
          <Image
            id="pc-mark"
            src="/img/mark.png"
            alt=""
            width={21}
            height={34}
            className={styles.mark}
            style={{ filter: appearance.dark ? 'brightness(0) invert(1)' : 'none' }}
          />
          <span className={styles.wordmark}>
            Pouso das
            <br />
            Castanheiras
          </span>
        </Link>
        <nav id="pc-nav" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              style={{
                opacity: pathname === item.href ? 1 : 0.6,
                borderBottom: pathname === item.href ? '1px solid currentColor' : '1px solid transparent',
              }}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <div id="pc-lang" className={styles.langSwitch}>
            <Link
              href={pathname}
              locale="pt"
              className={locale === 'pt' ? styles.langActive : styles.langInactive}
            >
              PT
            </Link>
            <span className={styles.langDivider}>/</span>
            <Link
              href={pathname}
              locale="en"
              className={locale === 'en' ? styles.langActive : styles.langInactive}
            >
              EN
            </Link>
          </div>
          <Link href="/reserva" className={styles.cta}>
            {t('header.cta')}
          </Link>
          <button
            type="button"
            id="pc-burger"
            className={styles.burger}
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
