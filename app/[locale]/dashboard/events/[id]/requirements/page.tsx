import { EventRequirementsContent } from '../../components/EventRequirementsContent';

export default async function EventRequirementsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return <EventRequirementsContent eventId={id} locale={locale} />;
}

