import { EventDetailContent } from '../components/EventDetailContent';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return <EventDetailContent locale={locale} id={id} />;
}
