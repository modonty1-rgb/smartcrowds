'use client';

import { AddJobDialog } from './AddJobDialog';
import { EventJobsTable } from './EventJobsTable';

interface EventJobsFormProps {
  eventId: string;
  jobs: { id: string; name: string; nameAr?: string | null }[];
  initialJobs: Array<{
    id: string;
    jobId: string;
    ratePerDay: number | null;
    job: { id: string; name: string; nameAr?: string | null };
  }>;
  locale: string;
}

export function EventJobsForm({
  eventId,
  jobs,
  initialJobs,
  locale,
}: EventJobsFormProps) {
  return (
    <div className="space-y-6">
      <AddJobDialog eventId={eventId} jobs={jobs} locale={locale} />

      <EventJobsTable
        eventJobs={initialJobs}
        jobs={jobs}
        eventId={eventId}
        locale={locale}
      />
    </div>
  );
}

