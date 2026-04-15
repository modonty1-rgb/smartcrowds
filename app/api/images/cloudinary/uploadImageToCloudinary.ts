
import cloudinary, { type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { initCloudinary } from '@/app/api/images/cloudinary/config';


export async function uploadImageToCloudinary(
  filePath: string,
  preset: string,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  // Ensure Cloudinary SDK is initialized from the centralized config (DB or env)
  const { error } = await initCloudinary();
  if (error) {
    const errorMessage = error === 'MISSING_CLOUD_CONFIG' 
      ? 'Missing Cloudinary cloud name configuration'
      : error === 'INVALID_CLOUD_NAME'
      ? 'Invalid Cloudinary cloud name format'
      : 'Missing Cloudinary configuration. Please check Cloudinary settings.';
    console.error('[uploadImageToCloudinary] Config initialization failed:', error);
    throw new Error(errorMessage);
  }

  // Upload options - try with preset first, fallback without preset
  const uploadOptions: UploadApiOptions = {
    folder: folder || 'products',
    resource_type: 'image',
    // Basic transformations during upload
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  };

  // Add preset if provided, otherwise rely on default settings
  if (preset && preset.trim()) {
    uploadOptions.upload_preset = preset;
  }

  let result: UploadApiResponse;
  try {
    // Only log in debug mode
    if (process.env.DEBUG_CLOUDINARY === 'true') {
      console.log('[uploadImageToCloudinary] Attempting upload with options:', {
        folder: uploadOptions.folder,
        preset: uploadOptions.upload_preset,
        hasFile: !!filePath,
        filePathLength: filePath?.length
      });
    }
    
    result = await cloudinary.v2.uploader.upload(filePath, uploadOptions);
    
    // Only log in debug mode
    if (process.env.DEBUG_CLOUDINARY === 'true') {
      console.log('[uploadImageToCloudinary] Upload successful:', {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format
      });
    }
  } catch (error: unknown) {
    console.error('[uploadImageToCloudinary] Upload error:', {
      error,
      message: (error as any)?.message,
      http_code: (error as any)?.http_code,
      name: (error as any)?.name,
      error_type: typeof error
    });
    
    // If preset fails, try without preset
    // Check for preset-related errors: http_code 400 with preset message, or error message about preset
    const errorMessage = (error as any)?.message || (error as any)?.error?.message || '';
    const httpCode = (error as any)?.http_code || (error as any)?.error?.http_code;
    const isPresetError = preset && (
      (httpCode === 400 && errorMessage?.toLowerCase().includes('preset')) ||
      errorMessage?.toLowerCase().includes('preset not found') ||
      errorMessage?.toLowerCase().includes('invalid preset')
    );
    
    if (isPresetError) {
      console.warn('[uploadImageToCloudinary] Preset error detected, retrying without preset...');
      delete uploadOptions.upload_preset;
      try {
        result = await cloudinary.v2.uploader.upload(filePath, uploadOptions);
        if (process.env.DEBUG_CLOUDINARY === 'true') {
          console.log('[uploadImageToCloudinary] Retry successful');
        }
      } catch (retryError: unknown) {
        console.error('[uploadImageToCloudinary] Retry also failed:', retryError);
        throw retryError as Error;
      }
    } else {
      throw error as Error;
    }
  }

  // Generate an optimized URL with auto format, quality, and responsive width
  const url = cloudinary.v2.url(result.public_id, {
    secure: true,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      { width: 'auto', crop: 'scale' },
    ],
  });
  return { url, publicId: result.public_id };
}
