'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updatePackage(id: string, formData: FormData) {
  await prisma.package.update({
    where: { id },
    data: {
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      priceLow: Number(formData.get('priceLow') ?? 0),
      priceHigh: Number(formData.get('priceHigh') ?? 0),
      priceSpecial: formData.get('priceSpecial') ? Number(formData.get('priceSpecial')) : null,
      active: formData.get('active') === 'on',
    },
  });

  revalidatePath('/painel/tarifario');
}
