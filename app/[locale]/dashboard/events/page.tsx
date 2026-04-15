import { EventsListContent } from './components/EventsListContent';

export default async function DashboardEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <EventsListContent locale={locale} />;
}


