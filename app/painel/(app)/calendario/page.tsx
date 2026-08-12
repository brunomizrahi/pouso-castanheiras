import { prisma } from '@/lib/prisma';
import { CalendarView } from './CalendarView';

export default async function CalendarioPage() {
  const reservations = await prisma.reservation.findMany({
    where: { deletedAt: null },
    select: { id: true, checkIn: true, checkOut: true, status: true },
  });

  return (
    <CalendarView
      reservations={reservations.map((r) => ({
        id: r.id,
        checkIn: r.checkIn.toISOString().slice(0, 10),
        checkOut: r.checkOut.toISOString().slice(0, 10),
        status: r.status,
      }))}
    />
  );
}
