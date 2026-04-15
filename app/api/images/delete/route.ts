import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import cloudinary from 'cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, recordId, field, publicId, url, index } = body as {
      table: string;
      recordId: string;
      field: string;
      publicId?: string;
      url?: string;
      index?: number;
    };

    if (!table || !recordId || !field) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 1) Delete from Cloudinary if publicId provided
    if (publicId) {
      try {
        await cloudinary.v2.uploader.destroy(publicId);
      } catch (err) {
        return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


