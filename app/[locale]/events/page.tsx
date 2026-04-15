import { EventsContent } from './components/EventsContent';
import { generateEventsMetadata } from './helpers/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateEventsMetadata(locale);
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <EventsContent locale={locale} />;
}
