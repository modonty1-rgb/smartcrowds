import { Card, CardContent } from '@/components/ui/card';
import { SubscribersByEventGroup } from '@/components/dashboard/subscribers/SubscribersByEventGroup';
import { listAllSubscribers } from '../actions/actions';

interface SubscribersListContentProps {
  locale: string;
}

export async function SubscribersListContent({ locale }: SubscribersListContentProps) {
  type Subscriber = {
    id: string;
    name: string;
    mobile: string;
    email: string;
    idNumber: string;
    nationality: { nameAr: string; nameEn: string } | null;
    age: number;
    idImageUrl: string | null;
    personalImageUrl: string | null;
    createdAt: Date;
    jobRequirement?: { id: string; job: { name: string } | null; ratePerDay: number | null } | null;
    event?: { title?: string | null } | null;
  };
  const subscribersRaw = (await listAllSubscribers()) as unknown as Subscriber[];
  const subscribers: Subscriber[] = subscribersRaw.map((s) => ({
    ...s,
    createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt as string),
  }));
  const isArabic = locale === 'ar';

  // Group subscribers by event
  const subscribersByEvent = subscribers.reduce((acc: Record<string, Subscriber[]>, subscriber: Subscriber) => {
    const eventTitle = subscriber.event?.title || 'Unknown Event';
    if (!acc[eventTitle]) {
      acc[eventTitle] = [];
    }
    acc[eventTitle].push(subscriber);
    return acc;
  }, {} as Record<string, Subscriber[]>);

  const eventTitles = Object.keys(subscribersByEvent).sort();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {isArabic ? 'جميع المشتركين' : 'All Subscribers'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic
            ? `إجمالي ${subscribers.length} مشترك من ${eventTitles.length} فعالية`
            : `Total ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''} from ${eventTitles.length} event${eventTitles.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {eventTitles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              {isArabic ? 'لا يوجد مشتركين حتى الآن' : 'No subscribers yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventTitles.map((eventTitle) => (
            <SubscribersByEventGroup
              key={eventTitle}
              eventTitle={eventTitle}
              subscribers={subscribersByEvent[eventTitle]}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}

