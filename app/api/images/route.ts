import {
  NextRequest,
  NextResponse,
} from 'next/server';

import { prisma as db } from '@/lib/prisma';
import { uploadImageToCloudinary } from '@/app/api/images/cloudinary/uploadImageToCloudinary';
import { revalidateTag, revalidatePath } from 'next/cache';

// Allowed models for image updates
const SUPPORTED_TABLES = {
  user: 'user',
  product: 'product',
  supplier: 'supplier',
  category: 'category',
  order: 'order',
  company: 'company',
  offer: 'offer',
  aboutPageContent: 'aboutPageContent',
  feature: 'feature',
  testimonial: 'testimonial',
  blog: 'post', // Blog uses 'post' model in Prisma
  projects: 'project', // Projects model
} as const;

type TableName = keyof typeof SUPPORTED_TABLES;

async function resolveCloudinaryContext(table: string | null, overridePreset: string | null, overrideFolder: string | null) {
  // Read directly from .env, not from DB
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  // Use "smartcrowds" as base folder
  let finalFolder: string;
  
  if (overrideFolder) {
    // If override folder doesn't start with "smartcrowds", prepend it
    finalFolder = overrideFolder.startsWith('smartcrowds/') || overrideFolder === 'smartcrowds'
      ? overrideFolder
      : `smartcrowds/${overrideFolder}`;
  } else if (table) {
    // Build folder path: smartcrowds/table
    finalFolder = `smartcrowds/${table}`;
  } else {
    // Default to smartcrowds
    finalFolder = 'smartcrowds';
  }

  const finalPreset = overridePreset || uploadPreset || undefined;

  return { finalPreset, finalFolder };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const recordId = formData.get('recordId') as string | null;
    const table = formData.get('table') as string | null;
    const tableField = formData.get('tableField') as string | null;
    const cloudinaryPreset = formData.get('cloudinaryPreset') as string | null;
    const folder = formData.get('folder') as string | null;
    const uploadOnly = formData.get('uploadOnly') as string | null;

    // Resolve preset/folder (DB when flagged, else env) and build final folder
    const { finalPreset, finalFolder } = await resolveCloudinaryContext(table, cloudinaryPreset, folder);



    // Validate required fields based on mode
    if (!file || !table) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            file: file?.name ?? null,
            table,
            uploadOnly: uploadOnly || 'false',
            cloudinaryPreset: cloudinaryPreset || finalPreset,
            folder: finalFolder,
          },
        },
        { status: 400 }
      );
    }

    // For non-upload-only mode, require recordId and tableField
    if (!uploadOnly && (!recordId || !tableField)) {
      return NextResponse.json(
        {
          error: 'Missing required fields for database update',
          details: {
            recordId,
            tableField,
            uploadOnly: uploadOnly || 'false',
          },
        },
        { status: 400 }
      );
    }

    // Only validate model if we need to update the database
    let model;
    if (!uploadOnly) {
      const modelKey = (SUPPORTED_TABLES as any)[table];
      if (!modelKey) {
        return NextResponse.json(
          { error: `Table "${table}" is not supported. Supported tables: ${Object.keys(SUPPORTED_TABLES).join(', ')}` },
          { status: 400 }
        );
      }
      model = (db as any)[modelKey];

      // Only log in debug mode
      if (process.env.DEBUG_IMAGE_API === 'true') {
        console.log('[IMAGE API DEBUG]', {
          table,
          modelKey,
          hasModel: !!model,
          hasUpdate: !!model?.update,
          supportedTables: Object.keys(SUPPORTED_TABLES)
        });
      }

      if (!model?.update) {
        return NextResponse.json(
          { error: `Invalid model or model not supported for updates: ${table}` },
          { status: 400 }
        );
      }
    }

    // Convert file to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    let imageUrl;
    let publicId: string | undefined;
    try {
      const uploaded = await uploadImageToCloudinary(dataUri, finalPreset || '', finalFolder);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
      // Only log in debug mode
      if (process.env.DEBUG_CLOUDINARY === 'true') {
        console.log('[CLOUDINARY UPLOAD SUCCESS]', {
          imageUrl,
          preset: finalPreset,
          folder: finalFolder,
          table
        });
      }
    } catch (cloudinaryError: unknown) {
      console.error('[CLOUDINARY UPLOAD ERROR]', {
        error: cloudinaryError,
        message: (cloudinaryError as any)?.message,
        http_code: (cloudinaryError as any)?.http_code,
        name: (cloudinaryError as any)?.name,
        stack: (cloudinaryError as any)?.stack,
        error_type: typeof cloudinaryError,
        stringified: JSON.stringify(cloudinaryError as any, Object.getOwnPropertyNames(cloudinaryError as any))
      });
      
      const errorMessage = (cloudinaryError as any)?.message || 
                           (cloudinaryError as any)?.http_code ? `HTTP ${(cloudinaryError as any).http_code}` : 
                           typeof cloudinaryError === 'string' ? (cloudinaryError as string) : 
                           'Unknown Cloudinary error';
      
      return NextResponse.json({
        error: 'Failed to upload image to Cloudinary',
        details: errorMessage
      }, { status: 500 });
    }

    // Update database only if not in upload-only mode
    if (!uploadOnly) {
      // Dynamically build data object
      const updateData = {
        [tableField!]: imageUrl,
      };

      let result;
      try {
        result = await model.update({
          where: { id: recordId },
          data: updateData,
        });
      } catch (dbError) {
        console.error('[DB UPDATE ERROR]', dbError);
        return NextResponse.json({ error: 'Failed to update record in DB' }, { status: 500 });
      }

      // Only log in debug mode
      if (process.env.DEBUG_IMAGE_API === 'true') {
        console.log(`[${table.toUpperCase()} UPDATED]`, result);
      }
      // Revalidate caches relevant to the updated table and homepage
      switch (table) {
        case 'product':
          revalidateTag('products');
          revalidatePath('/');
          break;
        case 'company':
          revalidateTag('company');
          revalidatePath('/');
          break;
        case 'category':
          revalidateTag('categories');
          revalidatePath('/');
          break;
        case 'offer':
          revalidateTag('promotions');
          revalidatePath('/');
          break;
        case 'testimonial':
          revalidateTag('about');
          revalidatePath('/about');
          break;
        case 'blog':
          revalidateTag('posts');
          revalidatePath('/blog');
          revalidatePath('/', 'layout');
          break;
        case 'projects':
          revalidateTag('projects');
          revalidatePath('/projects');
          revalidatePath('/', 'layout');
          break;
        default:
          break;
      }
    } else {
      // Only log in debug mode
      if (process.env.DEBUG_CLOUDINARY === 'true') {
        console.log(`[UPLOAD ONLY MODE] Image uploaded to Cloudinary: ${imageUrl}`);
      }
    }

    return NextResponse.json({ imageUrl, publicId });
  } catch (error) {
    console.error('[UNHANDLED ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
