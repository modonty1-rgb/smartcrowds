'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const locationInputSchema = z.object({
  city: z.string().min(1),
  address: z.string().optional().default(''),
});

export async function createLocation(input: unknown) {
  const data = locationInputSchema.parse(input);
  const created = await prisma.location.create({ data });
  revalidatePath('/ar/dashboard/locations');
  revalidatePath('/en/dashboard/locations');
  return created;
}

export async function listLocations() {
  return prisma.location.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getLocation(id: string) {
  return prisma.location.findUnique({ where: { id } });
}

export async function updateLocation(id: string, input: unknown) {
  const data = locationInputSchema.parse(input);
  const updated = await prisma.location.update({ where: { id }, data });
  revalidatePath('/ar/dashboard/locations');
  revalidatePath('/en/dashboard/locations');
  return updated;
}

export async function deleteLocation(id: string) {
  const useCount = await prisma.event.count({ where: { locationId: id } });
  if (useCount > 0) throw new Error('Location is in use by events');
  const deleted = await prisma.location.delete({ where: { id } });
  revalidatePath('/ar/dashboard/locations');
  revalidatePath('/en/dashboard/locations');
  return deleted;
}


