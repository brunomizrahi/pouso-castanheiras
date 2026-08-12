import { prisma } from '@/lib/prisma';
import { calculateReceivables } from '@/lib/finance';
import styles from './dashboard.module.css';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [reservationsThisMonth, allActive] = await Promise.all([
    prisma.reservation.count({
      where: { checkIn: { gte: startOfMonth, lt: startOfNextMonth }, deletedAt: null },
    }),
    prisma.reservation.findMany({
      where: { deletedAt: null },
      include: { package: true },
      orderBy: { checkIn: 'asc' },
    }),
  ]);

  const receivables = calculateReceivables(
    allActive.map((r) => ({
      id: r.id,
      checkIn: r.checkIn.toISOString().slice(0, 10),
      totalValue: Number(r.totalValue),
      status: r.status,
    }))
  );

  const pending = allActive.filter((r) => r.status !== 'pago');

  return (
    <div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Reservas este mês</div>
          <div className={styles.cardValue}>{reservationsThisMonth}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Valores a receber</div>
          <div className={styles.cardValue}>{formatBRL(receivables.total)}</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Pagamentos pendentes</h2>
      {pending.length === 0 ? (
        <p className={styles.empty}>Nenhuma reserva com pagamento pendente.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hóspede</th>
              <th>Check-in</th>
              <th>Pacote</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>{r.guestName}</td>
                <td>{formatDate(r.checkIn)}</td>
                <td>{r.package.name}</td>
                <td>{r.status === 'aguardando_sinal' ? 'Aguardando sinal' : 'Aguardando pagamento'}</td>
                <td>{formatBRL(Number(r.totalValue))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
