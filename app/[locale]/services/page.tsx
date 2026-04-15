import { ServicesContent } from './components/ServicesContent';
import { generateServicesMetadata } from './helpers/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateServicesMetadata(locale);
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ServicesContent locale={locale} />;
}
