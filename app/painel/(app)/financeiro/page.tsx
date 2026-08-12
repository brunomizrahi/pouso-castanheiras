import { prisma } from '@/lib/prisma';
import { calculateReceivables } from '@/lib/finance';
import { ProvisioningPanel } from './ProvisioningPanel';
import styles from './financeiro.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// See app/painel/(app)/page.tsx's formatDate for why this must be pinned to
// UTC: check-in dates are stored as UTC midnight, and the default (server
// local) timezone would display the wrong day for a Brazil-based deployment.
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default async function FinanceiroPage() {
  const reservations = await prisma.reservation.findMany({
    where: { deletedAt: null },
    select: { id: true, checkIn: true, totalValue: true, status: true, guestName: true },
    orderBy: { checkIn: 'asc' },
  });

  const forFinance = reservations.map((r) => ({
    id: r.id,
    checkIn: r.checkIn.toISOString().slice(0, 10),
    totalValue: Number(r.totalValue),
    status: r.status,
  }));

  const receivables = calculateReceivables(forFinance);
  const receivableById = new Map(reservations.map((r) => [r.id, r]));

  return (
    <div>
      <div className={styles.section}>
        <h1 className={styles.sectionTitle}>Valores a receber</h1>
        <div className={styles.total}>{formatBRL(receivables.total)}</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hóspede</th>
              <th>Check-in</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {receivables.items.map((item) => {
              const r = receivableById.get(item.id)!;
              return (
                <tr key={item.id}>
                  <td>{r.guestName}</td>
                  <td>{formatDate(r.checkIn)}</td>
                  <td>{formatBRL(item.totalValue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProvisioningPanel reservations={forFinance} />
    </div>
  );
}
