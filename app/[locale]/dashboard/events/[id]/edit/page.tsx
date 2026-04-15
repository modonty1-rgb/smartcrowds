import { notFound } from 'next/navigation';
import { getEventById } from '../../actions/actions';
import { listLocations } from '../../actions/actions';
import { EditEventForm } from '../../components/EditEventForm';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  const locations = await listLocations();
  return (
    <EditEventForm event={event} locations={locations} locale={locale} />
  );
}














