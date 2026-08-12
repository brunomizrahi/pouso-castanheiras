import { prisma } from '@/lib/prisma';
import { ReservationForm } from '../ReservationForm';
import { createReservation } from '../actions';

export default async function NovaReservaPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-petrona), serif', fontSize: 24, marginBottom: 20 }}>
        Nova reserva
      </h1>
      <ReservationForm action={createReservation} packages={packages} />
    </div>
  );
}
