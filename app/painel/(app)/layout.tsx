import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from './Sidebar';
import styles from './sidebar.module.css';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const pendingCount = await prisma.reservation.count({
    where: { status: { in: ['aguardando_sinal', 'aguardando_pagamento'] }, deletedAt: null },
  });

  return (
    <div className={styles.shell}>
      <Sidebar userEmail={session?.user?.email ?? ''} pendingCount={pendingCount} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
