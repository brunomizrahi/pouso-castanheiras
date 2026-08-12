import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReservationForm } from '../ReservationForm';
import { updateReservation, deleteReservation } from '../actions';

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Unlike a bare "date" input, `<input type="datetime-local">` has a real
// time-of-day component (when the transfer was actually agreed to run) and
// its value has no timezone/offset suffix, so the browser both submits and
// re-displays it as a plain *local* wall-clock string. `new Date(...)`
// therefore parses a submitted "2026-12-10T14:30" as 14:30 local time — but
// `toISOString()` converts back to UTC, so re-displaying it with
// `.toISOString().slice(0, 16)` showed a time shifted by the server's UTC
// offset (3 hours later for Brazil) every time this page was opened, and
// re-saving without touching the field would drift it further each time.
function toDateTimeInputValue(date: Date | null): string {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditarReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [reservation, packages] = await Promise.all([
    prisma.reservation.findUnique({ where: { id } }),
    prisma.package.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!reservation || reservation.deletedAt) notFound();

  const updateWithId = updateReservation.bind(null, id);
  const deleteWithId = deleteReservation.bind(null, id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24 }}>Editar reserva</h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            style={{ background: 'none', border: '1px solid #c0392b', color: '#c0392b', borderRadius: 999, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}
          >
            Excluir reserva
          </button>
        </form>
      </div>
      <ReservationForm
        action={updateWithId}
        packages={packages}
        initialValues={{
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail ?? undefined,
          guestPhone: reservation.guestPhone,
          checkIn: toDateInputValue(reservation.checkIn),
          checkOut: toDateInputValue(reservation.checkOut),
          packageId: reservation.packageId,
          pax: reservation.pax,
          totalValue: Number(reservation.totalValue),
          status: reservation.status,
          notes: reservation.notes ?? undefined,
          transferStatus: reservation.transferStatus,
          transferProvider: reservation.transferProvider ?? undefined,
          transferScheduledAt: toDateTimeInputValue(reservation.transferScheduledAt),
          transferNotes: reservation.transferNotes ?? undefined,
        }}
      />
    </div>
  );
}
