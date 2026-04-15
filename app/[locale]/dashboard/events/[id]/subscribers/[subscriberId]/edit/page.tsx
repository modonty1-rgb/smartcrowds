import { notFound } from 'next/navigation';
import {
  getEventSubscriber,
  getEventWithJobs,
} from '../../../../actions/actions';
import { listNationalities } from '@/app/actions/nationalities/actions';
import { SubscriberEditForm } from '@/components/dashboard/subscribers/SubscriberEditForm';

export default async function EditSubscriberPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; subscriberId: string }>;
}) {
  const { locale, id: eventId, subscriberId } = await params;

  const [subscriber, event, nationalities] = await Promise.all([
    getEventSubscriber(eventId, subscriberId),
    getEventWithJobs(eventId),
    listNationalities(),
  ]);

  if (!subscriber) {
    notFound();
  }

  const jobs =
    event?.jobs?.map((jobReq) => ({
      id: jobReq.id,
      job: jobReq.job,
      ratePerDay: jobReq.ratePerDay,
    })) ?? [];

  return (
    <SubscriberEditForm
      locale={locale}
      eventId={eventId}
      subscriber={{
        ...subscriber,
        dateOfBirth: subscriber.dateOfBirth ? subscriber.dateOfBirth.toISOString() : null,
        idExpiryDate: subscriber.idExpiryDate ? subscriber.idExpiryDate.toISOString() : null,
      }}
      jobs={jobs}
      nationalities={nationalities.map((nationality) => ({
        id: nationality.id,
        nameAr: nationality.nameAr,
        nameEn: nationality.nameEn,
      }))}
    />
  );
}

