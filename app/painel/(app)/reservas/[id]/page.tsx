import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReservationForm } from '../ReservationForm';
import { updateReservation, deleteReservation } from '../actions';

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateTimeInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 16) : '';
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
