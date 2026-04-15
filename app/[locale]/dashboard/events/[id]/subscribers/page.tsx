import { EventSubscribersContent } from '../../components/EventSubscribersContent';

export default async function EventSubscribersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  const acceptedOnly = sp?.accepted === '1';
  return <EventSubscribersContent eventId={id} locale={locale} acceptedOnly={acceptedOnly} />;
}

