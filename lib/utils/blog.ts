import readingTime from 'reading-time';

export function calculateReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.ceil(stats.minutes);
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const stripped = content.replace(/<[^>]*>/g, '').trim();
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return stripped.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}






















