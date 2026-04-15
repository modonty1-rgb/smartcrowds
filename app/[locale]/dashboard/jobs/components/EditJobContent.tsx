import { JobForm } from '@/components/dashboard/jobs/JobForm';
import { getJob } from '../actions/actions';

interface EditJobContentProps {
  jobId: string;
  locale: string;
}

export async function EditJobContent({ jobId, locale }: EditJobContentProps) {
  const job = await getJob(jobId);
  if (!job) return <p className="text-muted-foreground">{locale === 'ar' ? 'غير موجود' : 'Not found'}</p>;
  // Type assertion needed until Prisma client is regenerated after schema change
  const jobWithNameAr = job as typeof job & { nameAr?: string | null };
  return <JobForm id={job.id} name={job.name} nameAr={jobWithNameAr.nameAr} description={job.description || ''} />;
}

