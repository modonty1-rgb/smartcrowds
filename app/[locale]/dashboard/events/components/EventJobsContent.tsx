import { notFound } from 'next/navigation';
import { EventJobsForm } from '@/components/dashboard/events/EventJobsForm';
import { EventInfoCollapsible } from '@/components/dashboard/events/EventInfoCollapsible';
import { getEventWithJobs } from '../actions/actions';
import { listJobs } from '../actions/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EventJobsContentProps {
  eventId: string;
  locale: string;
}

export async function EventJobsContent({ eventId, locale }: EventJobsContentProps) {
  const [event, jobs] = await Promise.all([
    getEventWithJobs(eventId),
    listJobs(),
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
            {isArabic ? 'إدارة الوظائف' : 'Manage Jobs'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة وظائف الفعالية'
              : 'Manage event jobs'}
          </p>
        </div>
        <Link href="/dashboard/events">
          <Button variant="outline">
            {isArabic ? 'العودة للقائمة' : 'Back to List'}
          </Button>
        </Link>
      </div>

      <EventInfoCollapsible
        title={event.title}
        titleAr={(event as typeof event & { titleAr?: string | null }).titleAr}
        date={event.date}
        location={event.location}
        locale={locale}
      />

      <EventJobsForm
        eventId={eventId}
        jobs={jobs}
        initialJobs={event.jobs || []}
        locale={locale}
      />
    </section>
  );
}

