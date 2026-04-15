import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { listJobs } from '../actions/actions';
import { TranslateJobsButton } from '@/components/dashboard/jobs/TranslateJobsButton';
import { JobCard } from '@/components/dashboard/jobs/JobCard';

interface JobsListContentProps {
  locale: string;
}

export async function JobsListContent({ locale }: JobsListContentProps) {
  type JobItem = { id: string; name: string; nameAr?: string | null; description?: string | null };
  const jobs = (await listJobs()) as unknown as JobItem[];
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('Jobs', 'الوظائف')}</h1>
        <div className="flex items-center gap-2">
          <TranslateJobsButton />
          <Link href={`./jobs/new`}>
            <Button>{t('Create Job', 'إنشاء وظيفة')}</Button>
          </Link>
        </div>
      </div>
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              {t('No jobs yet', 'لا توجد وظائف بعد')}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: JobItem) => (
            <JobCard key={job.id} job={job} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

