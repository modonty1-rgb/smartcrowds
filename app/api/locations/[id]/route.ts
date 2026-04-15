import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { city, address } = body ?? {};
    if (!city || typeof city !== 'string') {
      return NextResponse.json({ error: 'city is required' }, { status: 400 });
    }
    const updated = await prisma.location.update({ where: { id }, data: { city, address: address || '' } });
    revalidatePath('/ar/dashboard/locations');
    revalidatePath('/en/dashboard/locations');
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}











