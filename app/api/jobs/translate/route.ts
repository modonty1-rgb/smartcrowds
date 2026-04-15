import { NextResponse } from 'next/server';
import { translateAllJobsToArabic } from '@/app/actions/jobs/actions';

export async function POST() {
  try {
    const result = await translateAllJobsToArabic();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        translated: result.translated,
        skipped: result.skipped,
        errors: result.errors,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in translate jobs API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to translate jobs',
      },
      { status: 500 }
    );
  }
}

