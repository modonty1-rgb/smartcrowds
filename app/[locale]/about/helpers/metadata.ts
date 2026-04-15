import type { Metadata } from 'next';

export function generateAboutMetadata(locale: string): Metadata {
  return {
    title:
      locale === 'ar'
        ? 'من نحن - SMART'
        : 'About Us - SMART CROWD',
    description:
      locale === 'ar'
        ? 'شركة سمارت الخيار الرائد في مجال إدارة الحشود وتنظيم الفعاليات'
        : 'SMART is one of the leading companies in crowd management and event organization',
  };
}

