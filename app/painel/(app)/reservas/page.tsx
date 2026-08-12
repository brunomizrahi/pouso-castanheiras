import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './reservas.module.css';

const STATUS_LABEL: Record<string, string> = {
  aguardando_sinal: 'Aguardando sinal',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
};

const TRANSFER_LABEL: Record<string, string> = {
  organizado: 'Organizado',
  pendente: 'Pendente',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// See app/painel/(app)/page.tsx's formatDate for why this must be pinned to
// UTC: check-in/check-out are stored as UTC midnight, and the default
// (server local) timezone would display the wrong day for a Brazil-based
// deployment.
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const reservations = await prisma.reservation.findMany({
    where: {
      deletedAt: null,
      ...(q ? { guestName: { contains: q, mode: 'insensitive' } } : {}),
    },
    include: { package: true },
    orderBy: { checkIn: 'desc' },
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservas</h1>
        <Link href="/painel/reservas/nova" className={styles.newButton}>
          Nova reserva
        </Link>
      </div>

      <form className={styles.searchForm} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por hóspede…"
          className={styles.searchInput}
        />
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hóspede</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Pacote</th>
            <th>Pagamento</th>
            <th>Traslado</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/painel/reservas/${r.id}`} className={styles.rowLink}>
                  {r.guestName}
                </Link>
              </td>
              <td>{formatDate(r.checkIn)}</td>
              <td>{formatDate(r.checkOut)}</td>
              <td>{r.package.name}</td>
              <td>{STATUS_LABEL[r.status]}</td>
              <td>{TRANSFER_LABEL[r.transferStatus]}</td>
              <td>{formatBRL(Number(r.totalValue))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
