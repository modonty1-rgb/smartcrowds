// app/actions/updateImage.ts
'use server';

import db from '@/lib/prisma';

export async function updateImage({
  url,
  table,
  recordId,
}: {
  url: string;
  table: string;
  recordId: string;
}) {
  try {
    const model = (db as any)[table];
    if (!model || typeof model.update !== 'function') {
      throw new Error(`Model '${table}' is not valid or does not support update.`);
    }

    await model.update({
      where: { id: recordId },
      data: { image: url },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update image' };
  }
}
