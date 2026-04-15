import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/routing';
import type { Metadata } from 'next';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  
  return {
    title: {
      default: isArabic ? 'SMART - إدارة الحشود' : 'SMART - Crowd Management',
      template: `%s | ${isArabic ? 'SMART' : 'SMART'}`,
    },
    description: isArabic
      ? 'شركة رائدة في مجال إدارة الحشود وتنظيم الفعاليات في المملكة العربية السعودية. حلول شاملة وآمنة لنجاح الفعاليات الكبرى.'
      : 'Leading crowd management and event organization company in Saudi Arabia. Comprehensive and safe solutions for major event success.',
    keywords: isArabic
      ? ['إدارة الحشود', 'تنظيم الفعاليات', 'السعودية', 'الأمن والسلامة']
      : ['crowd management', 'event organization', 'Saudi Arabia', 'security'],
    authors: [{ name: 'SMART CROWD' }],
    openGraph: {
      type: 'website',
      locale: locale,
      url: `https://hthkia.com/${locale}`,
      siteName: 'SMART CROWD',
      title: isArabic
        ? 'SMART - إدارة الحشود وتنظيم الفعاليات'
        : 'SMART - Crowd Management',
      description: isArabic
        ? 'شركة رائدة في مجال إدارة الحشود وتنظيم الفعاليات في المملكة العربية السعودية'
        : 'Leading crowd management and event organization company in Saudi Arabia',
    },
    twitter: {
      card: 'summary_large_image',
      title: isArabic
        ? 'SMART - إدارة الحشود'
        : 'SMART - Crowd Management',
      description: isArabic
        ? 'شركة رائدة في مجال إدارة الحشود'
        : 'Leading crowd management company',
      creator: '@SMARTCROWD.SA',
    },
    alternates: {
      canonical: `https://hthkia.com/${locale}`,
      languages: {
        'ar': 'https://hthkia.com/ar',
        'en': 'https://hthkia.com/en',
        'x-default': 'https://hthkia.com/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SMART CROWD',
    alternateName: 'SMARTCROWD.SA',
    url: 'https://hthkia.com',
    logo: 'https://hthkia.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+966-58-011-2052',
      contactType: 'customer service',
      email: 'Info@smartcrowdme.com',
      areaServed: 'SA',
      availableLanguage: ['Arabic', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Al-Rusaifah, Third Ring Road – Al-Sharif Yahya Tower',
      addressLocality: 'Makkah',
      addressCountry: 'SA',
    },
    sameAs: [
      'https://instagram.com/SMARTCROWD.SA',
      'https://twitter.com/SMARTCROWD.SA',
    ],
  };

  const isRTL = locale === 'ar';

  return (
    <>
      <GoogleAnalytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.lang = '${locale}';
            document.documentElement.dir = '${isRTL ? 'rtl' : 'ltr'}';
          `,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </NextIntlClientProvider>
    </>
  );
}
