'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './sidebar.module.css';

const NAV_ITEMS = [
  { href: '/painel', label: 'Visão geral' },
  { href: '/painel/calendario', label: 'Calendário' },
  { href: '/painel/reservas', label: 'Reservas' },
  { href: '/painel/financeiro', label: 'Financeiro' },
  { href: '/painel/tarifario', label: 'Tarifário' },
] as const;

export function Sidebar({ userEmail, pendingCount }: { userEmail: string; pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Pouso das Castanheiras</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
          >
            <span>{item.label}</span>
            {item.href === '/painel/reservas' && pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className={styles.userRow}>
        <div>{userEmail}</div>
        <button type="button" className={styles.logoutButton} onClick={() => signOut({ callbackUrl: '/painel/login' })}>
          Sair
        </button>
      </div>
    </aside>
  );
}
