'use server';

import { prisma } from '@/lib/prisma';
import { clientSchema, type ClientInput } from '@/lib/validations/client';
import { revalidatePath } from 'next/cache';

export async function createClient(input: ClientInput) {
  try {
    const validated = clientSchema.parse(input);

    const client = await prisma.client.create({
      data: {
        name: validated.name.trim(),
        logoUrl: validated.logoUrl,
        websiteUrl: validated.websiteUrl || null,
        published: validated.published ?? false,
        order: validated.order ?? 0,
      },
    });

    revalidatePath('/[locale]/dashboard/clients');
    revalidatePath('/[locale]');
    return { success: true, client };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'Failed to create client' };
  }
}

export async function updateClient(id: string, input: Partial<ClientInput>) {
  try {
    const data: Partial<{ name: string; logoUrl: string; websiteUrl: string | null; published: boolean; order: number }> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.websiteUrl !== undefined) data.websiteUrl = input.websiteUrl || null;
    if (input.published !== undefined) data.published = input.published;
    if (input.order !== undefined) data.order = input.order;

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    revalidatePath('/[locale]/dashboard/clients');
    revalidatePath('/[locale]');
    return { success: true, client };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'Failed to update client' };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath('/[locale]/dashboard/clients');
    revalidatePath('/[locale]');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'Failed to delete client' };
  }
}

export async function listClients(options?: { published?: boolean }) {
  try {
    const where: { published?: boolean } = {};
    if (options?.published !== undefined) where.published = options.published;
    const clients = await prisma.client.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return clients;
  } catch (error) {
    return [];
  }
}


