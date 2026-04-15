import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Link } from '@/lib/routing';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { EventSettingsMenu } from '@/components/dashboard/events/EventSettingsMenu';
import { Eye } from 'lucide-react';
import { listEvents } from '../actions/actions';

interface EventsListContentProps {
  locale: string;
}

type DashboardEvent = {
  id: string;
  title: string;
  titleAr?: string | null;
  date: string | Date;
  imageUrl?: string | null;
  published?: boolean | null;
  acceptJobs?: boolean | null;
  completed?: boolean | null;
  location?: { city?: string | null } | null;
  requirements?: unknown[] | null;
  jobs?: unknown[] | null;
  subscribers?: Array<{ accepted?: boolean | null }> | null;
};

export async function EventsListContent({ locale }: EventsListContentProps) {
  const events = (await listEvents()) as unknown as DashboardEvent[];
  const isArabic = locale === 'ar';

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isArabic ? 'الفعاليات' : 'Events'}</h1>
        <Link href="/dashboard/events/new">
          <Button>{isArabic ? 'إنشاء فعالية' : 'Create Event'}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: DashboardEvent) => {
          const requirementsCount = event.requirements?.length || 0;
          const jobsCount = event.jobs?.length || 0;
          const subscribersCount = event.subscribers?.length || 0;
          const acceptedCount = (event.subscribers || []).filter((s: { accepted?: boolean | null }) => !!s.accepted).length;
          const isPublished = event.published ?? false;

          return (
            <Card
              key={event.id}
              className={`overflow-hidden flex flex-col transition-shadow ${isPublished
                ? 'border-l-4 border-green-500 hover:shadow-green-200/20'
                : 'border-l-4 border-red-500 hover:shadow-red-200/20'
                }`}
            >
              <div className="relative h-40 bg-muted">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={isArabic && event.titleAr ? event.titleAr : event.title}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="font-semibold mb-1 flex items-center justify-between">
                  <span>{isArabic && event.titleAr ? event.titleAr : event.title}</span>
                  <Link href={`/events/${event.id}`} title={isArabic ? 'عرض' : 'View'}>
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {format(new Date(event.date), 'PPP')}
                  {event.location && ` • ${event.location.city}`}
                </div>
                {/* Settings row with status badge */}
                <div className="flex items-center gap-2 mb-3">
                  <EventSettingsMenu
                    eventId={event.id}
                    published={event.published ?? false}
                    acceptJobs={event.acceptJobs ?? true}
                    completed={event.completed ?? false}
                    locale={locale}
                  />
                  {isPublished ? (
                    <Badge variant="default" className="bg-green-600">
                      {isArabic ? 'منشور' : 'Published'}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-red-600">
                      {isArabic ? 'مسودة' : 'Draft'}
                    </Badge>
                  )}
                  {!event.acceptJobs && (
                    <Badge variant="default" className="bg-orange-600">
                      {isArabic ? 'مغلق للوظائف' : 'Hiring Closed'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {event.completed && (
                    <Badge variant="default" className="bg-green-600">
                      {isArabic ? 'تم التنفيذ' : 'Done'}
                    </Badge>
                  )}
                  {requirementsCount > 0 && (
                    <Badge variant="secondary">
                      {isArabic ? `${requirementsCount} متطلب` : `${requirementsCount} Requirements`}
                    </Badge>
                  )}
                  {jobsCount > 0 && (
                    <Badge variant="secondary">
                      {isArabic ? `${jobsCount} وظيفة` : `${jobsCount} Jobs`}
                    </Badge>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/events/${event.id}/requirements`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        {isArabic ? 'المتطلبات' : 'Requirements'}
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/jobs`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        {isArabic ? 'الوظائف' : 'Jobs'}
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/events/${event.id}/subscribers`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        {isArabic ? `المتقدمين (${subscribersCount})` : `Applicants (${subscribersCount})`}
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/subscribers?accepted=1`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        {isArabic ? `المقبولون (${acceptedCount})` : `Accepted (${acceptedCount})`}
                      </Button>
                    </Link>
                  </div>
                  {/* Removed standalone View button, use the Eye icon near the title instead */}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

