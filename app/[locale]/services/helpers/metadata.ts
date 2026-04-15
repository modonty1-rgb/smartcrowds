import type { Metadata } from 'next';

export async function generateServicesMetadata(
  locale: string
): Promise<Metadata> {
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'خدماتنا - SMART' : 'Services - SMART',
    description: isArabic
      ? 'خدمات شاملة في إدارة الحشود وتنظيم الفعاليات في المملكة العربية السعودية'
      : 'Comprehensive crowd management and event organization services in Saudi Arabia',
    openGraph: {
      title: isArabic ? 'خدماتنا - SMART' : 'Services - SMART',
      description: isArabic
        ? 'خدمات شاملة في إدارة الحشود'
        : 'Comprehensive crowd management services',
    },
  };
}

