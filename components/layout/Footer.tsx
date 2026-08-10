import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './Footer.module.css';

const NAV_LINKS = [
  { href: '/a-casa', key: 'casa' },
  { href: '/experiencias', key: 'experiencias' },
  { href: '/como-chegar', key: 'chegar' },
  { href: '/tarifas', key: 'tarifas' },
  { href: '/midia', key: 'midia' },
] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <Image src="/img/mark.png" alt="" width={29} height={48} className={styles.mark} />
              <span className={styles.wordmark}>
                Pouso das
                <br />
                Castanheiras
              </span>
            </Link>
            <div className={styles.address}>
              <div>{t('footer.address')}</div>
              <div>{t('footer.coordinates')}</div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.label}>{t('footer.navigate')}</div>
            <nav className={styles.list}>
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.col}>
            <div className={styles.label}>{t('footer.reservations')}</div>
            <div className={styles.list}>
              <a href="https://wa.me/5511942995588" target="_blank" rel="noreferrer">
                WhatsApp (11) 94299-5588
              </a>
              <a href="mailto:contato@pousodascastanheiras.com.br">
                contato@pousodascastanheiras.com.br
              </a>
              <a href="https://instagram.com/pouso.das.castanheiras" target="_blank" rel="noreferrer">
                @pouso.das.castanheiras
              </a>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.label}>{t('footer.hours')}</div>
            <div className={styles.list}>
              <span>{t('footer.checkin')}</span>
              <span>{t('footer.checkout')}</span>
              <span>{t('footer.oneGroup')}</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div>© {new Date().getFullYear()} Pouso das Castanheiras</div>
          <div>{t('footer.tagline')}</div>
        </div>
      </div>
    </footer>
  );
}
