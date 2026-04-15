import type { Metadata } from 'next';

export async function generateEventsMetadata(
  locale: string
): Promise<Metadata> {
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'الفعاليات - SMART' : 'Events - SMART',
    description: isArabic
      ? 'تعرف على فعالياتنا وأنشطتنا القادمة'
      : 'Explore our upcoming events and activities',
    openGraph: {
      title: isArabic ? 'الفعاليات - SMART' : 'Events - SMART',
      description: isArabic
        ? 'فعاليات وأنشطة شركة سمارت'
        : 'SMART company events and activities',
    },
  };
}

