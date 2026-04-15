'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const nationalityInputSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
});

export async function createNationality(input: unknown) {
  try {
    const data = nationalityInputSchema.parse(input);
    const created = await prisma.nationality.create({ data });
    revalidatePath('/ar/dashboard/nationalities');
    revalidatePath('/en/dashboard/nationalities');
    revalidatePath('/ar/events');
    revalidatePath('/en/events');
    return { success: true, nationality: created };
  } catch (error) {
    console.error('Error creating nationality:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create nationality' };
  }
}

export async function listNationalities() {
  try {
    return await prisma.nationality.findMany({ orderBy: { nameAr: 'asc' } });
  } catch (error) {
    console.error('Error listing nationalities:', error);
    return [];
  }
}

export async function getNationality(id: string) {
  try {
    return await prisma.nationality.findUnique({ where: { id } });
  } catch (error) {
    console.error('Error getting nationality:', error);
    return null;
  }
}

export async function updateNationality(id: string, input: unknown) {
  try {
    const data = nationalityInputSchema.parse(input);
    const updated = await prisma.nationality.update({ where: { id }, data });
    revalidatePath('/ar/dashboard/nationalities');
    revalidatePath('/en/dashboard/nationalities');
    revalidatePath('/ar/events');
    revalidatePath('/en/events');
    return { success: true, nationality: updated };
  } catch (error) {
    console.error('Error updating nationality:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update nationality' };
  }
}

export async function deleteNationality(id: string) {
  try {
    const useCount = await prisma.eventSubscriber.count({ where: { nationalityId: id } });
    if (useCount > 0) {
      return { error: 'Nationality is in use by subscribers and cannot be deleted' };
    }
    const deleted = await prisma.nationality.delete({ where: { id } });
    revalidatePath('/ar/dashboard/nationalities');
    revalidatePath('/en/dashboard/nationalities');
    revalidatePath('/ar/events');
    revalidatePath('/en/events');
    return { success: true, nationality: deleted };
  } catch (error) {
    console.error('Error deleting nationality:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete nationality' };
  }
}

