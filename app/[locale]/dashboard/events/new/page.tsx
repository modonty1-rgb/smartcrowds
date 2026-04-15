import EventForm from '@/components/dashboard/events/EventForm';
import { listLocations } from '../actions/actions';

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const locations = await listLocations();
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">{locale === 'ar' ? 'إنشاء فعالية' : 'Create Event'}</h1>
      <EventForm locations={locations} locale={locale} />
    </section>
  );
}


