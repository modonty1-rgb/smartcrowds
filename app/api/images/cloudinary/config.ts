import cloudinary from 'cloudinary';

// Read credentials directly from .env, not from DB
export const initCloudinary = async (): Promise<{ error?: string }> => {
  // Read directly from .env
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    console.error('[initCloudinary] Missing cloud name');
    return { error: 'MISSING_CLOUD_CONFIG' };
  }

  // Clean cloud name (remove any leading equals or spaces)
  const cleanedCloudName = cloudName.trim().replace(/^[\s=]+/, '').replace(/[\s=]+$/, '');
  
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanedCloudName)) {
    console.error('[initCloudinary] Invalid cloud name format:', cleanedCloudName);
    return { error: 'INVALID_CLOUD_NAME' };
  }

  // Only log in development when debugging
  if (process.env.DEBUG_CLOUDINARY === 'true') {
    console.log('[initCloudinary] Configuring Cloudinary:', {
      hasCloudName: !!cleanedCloudName,
      cloudNameLength: cleanedCloudName.length,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret
    });
  }

  cloudinary.v2.config({
    cloud_name: cleanedCloudName,
    api_key: apiKey || undefined,
    api_secret: apiSecret || undefined,
  });

  return {};
};
