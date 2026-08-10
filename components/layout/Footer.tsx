import { useTranslations } from 'next-intl';
import styles from './Footer.module.css';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>Pouso das Castanheiras</div>
      <nav className={styles.links}>
        <a href="https://instagram.com/pouso.das.castanheiras" target="_blank" rel="noreferrer">
          {t('footer.instagram')}
        </a>
        <a href="https://wa.me/5511942995588" target="_blank" rel="noreferrer">
          {t('footer.whatsapp')}
        </a>
        <a href="mailto:contato@pousodascastanheiras.com.br">{t('footer.email')}</a>
      </nav>
      <div className={styles.copy}>
        © {new Date().getFullYear()} Pouso das Castanheiras — Novo Airão, AM
      </div>
    </footer>
  );
}
