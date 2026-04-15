import { EventJobsContent } from '../../components/EventJobsContent';

export default async function EventJobsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return <EventJobsContent eventId={id} locale={locale} />;
}

