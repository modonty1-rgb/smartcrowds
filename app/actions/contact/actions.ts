'use server';

import { prisma } from '@/lib/prisma';
import { contactFormSchema } from '@/lib/validations/contact';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createContactMessage(input: unknown) {
  const data = contactFormSchema.parse(input);
  const created = await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message,
      status: 'NEW',
    },
  });
  revalidatePath('/ar/dashboard/contact');
  revalidatePath('/en/dashboard/contact');
  return created;
}

export async function listContactMessages(status?: string) {
  const where = status ? { status } : {};
  return prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

const statusSchema = z.enum(['NEW', 'READ']);

export async function updateContactMessageStatus(id: string, status: string) {
  const validStatus = statusSchema.parse(status);
  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { status: validStatus },
  });
  revalidatePath('/ar/dashboard/contact');
  revalidatePath('/en/dashboard/contact');
  return updated;
}

export async function deleteContactMessage(id: string) {
  const deleted = await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/ar/dashboard/contact');
  revalidatePath('/en/dashboard/contact');
  return deleted;
}

