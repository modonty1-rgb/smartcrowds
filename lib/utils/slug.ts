/**
 * Generate a URL-friendly slug from text while preserving Arabic characters for SEO
 * Supports both Arabic and Latin characters
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  // Arabic Unicode range: U+0600 to U+06FF
  // Also includes Arabic Extended-A (U+08A0 to U+08FF) and Arabic Presentation Forms
  const arabicRange = /[\u0600-\u06FF\u08A0-\u08FF]/;
  
  let slug = text
    .trim()
    // Lowercase Latin characters (Arabic doesn't have case)
    .replace(/[A-Z]/g, (char) => char.toLowerCase())
    // Convert multiple spaces/underscores to single space
    .replace(/[\s_]+/g, ' ')
    // Convert spaces to hyphens
    .replace(/\s+/g, '-')
    // Remove unsafe URL characters but preserve Arabic, Latin, numbers, and hyphens
    .replace(/[^\u0600-\u06FF\u08A0-\u08FFa-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // If slug is empty after processing, generate a fallback
  if (!slug) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    slug = `item-${timestamp}-${random}`;
  }
  
  return slug;
}

