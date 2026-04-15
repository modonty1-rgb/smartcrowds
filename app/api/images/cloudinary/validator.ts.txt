export const validateImageFile = async (
  imageFile: unknown,
): Promise<{ valid: boolean; error?: string }> => {
  if (!imageFile) return { valid: false, error: 'NO_FILE_SELECTED' };

  if (typeof imageFile === 'string') {
    try {
      new URL(imageFile);
      return /\.(jpg|jpeg|png|webp|avif)$/i.test(imageFile)
        ? { valid: true }
        : { valid: false, error: 'UNSUPPORTED_FORMAT' };
    } catch {
      return { valid: false, error: 'INVALID_URL' };
    }
  }

  if (!(imageFile instanceof File || imageFile instanceof Blob)) {
    return { valid: false, error: 'INVALID_FILE_TYPE' };
  }

  const file = imageFile as File;
  if (file.size === 0) return { valid: false, error: 'EMPTY_FILE' };
  if (file.size > 5 * 1024 * 1024) return { valid: false, error: 'FILE_TOO_LARGE' };
  if (!file.type.startsWith('image/')) return { valid: false, error: 'NOT_AN_IMAGE' };

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimeTypes.includes(file.type)) {
    return { valid: false, error: 'UNSUPPORTED_FORMAT' };
  }

  return { valid: true };
};

export const formatErrorMessage = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    MISSING_CLOUD_CONFIG: 'إعدادات Cloudinary غير مكتملة',
    MISSING_UPLOAD_PRESET: 'إعدادات التحميل غير محددة',
    INVALID_IMAGE: 'الصورة غير صالحة',
    UPLOAD_FAILED: 'فشل رفع الصورة',
    NO_FILE_SELECTED: 'لم يتم اختيار ملف',
    UNSUPPORTED_FORMAT: 'صيغة الملف غير مدعومة',
    INVALID_URL: 'رابط الصورة غير صالح',
    EMPTY_FILE: 'الملف فارغ',
    FILE_TOO_LARGE: 'حجم الملف كبير جداً',
    NOT_AN_IMAGE: 'الملف ليس صورة',
    INVALID_RESPONSE: 'استجابة غير صالحة من السحابة',
    INVALID_FILE_TYPE: 'نوع ملف غير صالح',
  };

  return errorMap[errorCode] || 'حدث خطأ غير متوقع';
};
