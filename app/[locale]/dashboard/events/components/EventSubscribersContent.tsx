import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import { ExportSubscribersButton } from '@/components/dashboard/subscribers/ExportSubscribersButton';
import { SubscribersTable } from '@/components/dashboard/subscribers/SubscribersTable';
import { getEventById, listEventSubscribers } from '../actions/actions';

interface EventSubscribersContentProps {
  eventId: string;
  locale: string;
  acceptedOnly?: boolean;
}

export async function EventSubscribersContent({ eventId, locale, acceptedOnly = false }: EventSubscribersContentProps) {
  const [event, subscribers] = await Promise.all([
    getEventById(eventId),
    listEventSubscribers(eventId, acceptedOnly),
  ]);

  if (!event) {
    notFound();
  }

  const isArabic = locale === 'ar';

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {acceptedOnly ? (isArabic ? 'المقبولون' : 'Accepted') : (isArabic ? 'المتقدمون' : 'Applicants')}
          </h1>
          <p className="text-muted-foreground">
            {acceptedOnly
              ? (isArabic ? `${event.title} - ${subscribers.length} مقبول` : `${event.title} - ${subscribers.length} accepted`)
              : (isArabic ? `${event.title} - ${subscribers.length} متقدم` : `${event.title} - ${subscribers.length} applicants`)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subscribers.length > 0 && (
            <ExportSubscribersButton eventId={eventId} eventTitle={event.title} />
          )}
          <Link href="/dashboard/events">
            <Button variant="outline">
              {isArabic ? 'العودة للقائمة' : 'Back to Events'}
            </Button>
          </Link>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              {isArabic ? 'لا يوجد مشتركين حتى الآن' : 'No subscribers yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <SubscribersTable subscribers={subscribers} locale={locale} eventId={eventId} />
      )}
    </section>
  );
}

