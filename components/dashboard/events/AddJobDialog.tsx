'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { eventJobRequirementSchema } from '@/lib/validations/event';
import { addEventJob } from '@/app/actions/events/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from '@/lib/routing';
import { showErrorSwal } from '@/lib/utils/swal';
import { Plus } from 'lucide-react';

type JobFormValues = z.input<typeof eventJobRequirementSchema>;

interface AddJobDialogProps {
  eventId: string;
  jobs: { id: string; name: string; nameAr?: string | null }[];
  locale: string;
}

export function AddJobDialog({ eventId, jobs, locale }: AddJobDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isArabic = locale === 'ar';

  // Filter jobs based on locale - only show jobs with the appropriate locale name
  const filteredJobs = isArabic
    ? jobs.filter(job => job.nameAr && job.nameAr.trim()) // Only Arabic names
    : jobs.filter(job => job.name && job.name.trim()); // Only English names

  // Sort jobs to prioritize locale-appropriate names
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (isArabic) {
      const aHasAr = a.nameAr && a.nameAr.trim();
      const bHasAr = b.nameAr && b.nameAr.trim();
      if (aHasAr && !bHasAr) return -1;
      if (!aHasAr && bHasAr) return 1;
    }
    return 0;
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(eventJobRequirementSchema),
    defaultValues: {
      jobId: '',
      ratePerDay: 0,
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    startTransition(async () => {
      // Ensure ratePerDay is a number (z.coerce handles string to number conversion)
      const ratePerDay = typeof values.ratePerDay === 'number' ? values.ratePerDay : Number(values.ratePerDay) || 0;
      const result = await addEventJob(eventId, values.jobId, ratePerDay);
      if (result?.success) {
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        showErrorSwal(result?.error || 'Failed to add job', locale);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة وظيفة جديدة' : 'Add New Job'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'إضافة وظيفة جديدة' : 'Add New Job'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'اختر الوظيفة وأدخل المعدل اليومي'
              : 'Select a job and enter the rate per day'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobId">
              {isArabic ? 'الوظيفة' : 'Job'}
            </Label>
            <select
              id="jobId"
              className="w-full border rounded-md h-10 px-3 text-sm"
              {...form.register('jobId')}
              defaultValue=""
            >
              <option value="" disabled>
                {isArabic ? 'اختر الوظيفة' : 'Select job'}
              </option>
              {sortedJobs.map((job) => {
                const displayName = isArabic && job.nameAr && job.nameAr.trim() 
                  ? job.nameAr 
                  : job.name || job.nameAr || 'Untitled';
                return (
                  <option key={job.id} value={job.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            {form.formState.errors.jobId && (
              <p className="text-sm text-red-600">
                {form.formState.errors.jobId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePerDay">
              {isArabic ? 'المعدل اليومي' : 'Rate per Day'}
            </Label>
            <Input
              id="ratePerDay"
              type="number"
              step="0.01"
              min="0"
              {...form.register('ratePerDay', {
                valueAsNumber: true,
              })}
              placeholder={isArabic ? 'أدخل المعدل اليومي' : 'Enter rate per day'}
            />
            {form.formState.errors.ratePerDay && (
              <p className="text-sm text-red-600">
                {form.formState.errors.ratePerDay.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isArabic
                  ? 'جاري الإضافة...'
                  : 'Adding...'
                : isArabic
                ? 'إضافة'
                : 'Add Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

