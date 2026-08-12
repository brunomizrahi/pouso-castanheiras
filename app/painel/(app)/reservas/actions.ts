'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export interface ReservationFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  packageId: string;
  pax: number;
  totalValue: number;
  status: 'aguardando_sinal' | 'aguardando_pagamento' | 'pago';
  notes: string;
  transferStatus: 'organizado' | 'pendente';
  transferProvider: string;
  transferScheduledAt: string;
  transferNotes: string;
}

function parseFormData(formData: FormData): ReservationFormData {
  return {
    guestName: String(formData.get('guestName') ?? ''),
    guestEmail: String(formData.get('guestEmail') ?? ''),
    guestPhone: String(formData.get('guestPhone') ?? ''),
    checkIn: String(formData.get('checkIn') ?? ''),
    checkOut: String(formData.get('checkOut') ?? ''),
    packageId: String(formData.get('packageId') ?? ''),
    pax: Number(formData.get('pax') ?? 1),
    totalValue: Number(formData.get('totalValue') ?? 0),
    status: String(formData.get('status') ?? 'aguardando_sinal') as ReservationFormData['status'],
    notes: String(formData.get('notes') ?? ''),
    transferStatus: String(formData.get('transferStatus') ?? 'pendente') as ReservationFormData['transferStatus'],
    transferProvider: String(formData.get('transferProvider') ?? ''),
    transferScheduledAt: String(formData.get('transferScheduledAt') ?? ''),
    transferNotes: String(formData.get('transferNotes') ?? ''),
  };
}

export async function createReservation(formData: FormData) {
  const session = await auth();
  const data = parseFormData(formData);

  await prisma.reservation.create({
    data: {
      source: 'manual',
      status: data.status,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone,
      packageId: data.packageId,
      pax: data.pax,
      notes: data.notes || null,
      totalValue: data.totalValue,
      transferStatus: data.transferStatus,
      transferProvider: data.transferProvider || null,
      transferScheduledAt: data.transferScheduledAt ? new Date(data.transferScheduledAt) : null,
      transferNotes: data.transferNotes || null,
      createdByUserId: session?.user?.id ?? null,
    },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}

export async function updateReservation(id: string, formData: FormData) {
  const data = parseFormData(formData);

  await prisma.reservation.update({
    where: { id },
    data: {
      status: data.status,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone,
      packageId: data.packageId,
      pax: data.pax,
      notes: data.notes || null,
      totalValue: data.totalValue,
      transferStatus: data.transferStatus,
      transferProvider: data.transferProvider || null,
      transferScheduledAt: data.transferScheduledAt ? new Date(data.transferScheduledAt) : null,
      transferNotes: data.transferNotes || null,
    },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}

export async function deleteReservation(id: string) {
  await prisma.reservation.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/painel/reservas');
  revalidatePath('/painel/calendario');
  revalidatePath('/painel');
  redirect('/painel/reservas');
}
