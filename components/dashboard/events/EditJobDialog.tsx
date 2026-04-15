'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { eventJobRequirementSchema } from '@/lib/validations/event';
import { updateEventJob } from '@/app/actions/events/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/lib/routing';
import { showErrorSwal } from '@/lib/utils/swal';

type JobFormValues = z.input<typeof eventJobRequirementSchema>;

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventJobRequirementId: string;
  jobId: string;
  ratePerDay: number | null;
  jobs: { id: string; name: string; nameAr?: string | null }[];
  locale: string;
}

export function EditJobDialog({
  open,
  onOpenChange,
  eventJobRequirementId,
  jobId,
  ratePerDay,
  jobs,
  locale,
}: EditJobDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isArabic = locale === 'ar';

  // Filter jobs based on locale - only show jobs with the appropriate locale name
  // But always include the currently selected job to prevent breaking existing data
  const filteredJobs = isArabic
    ? jobs.filter(job => {
        // Always include the selected job
        if (job.id === jobId) return true;
        // Otherwise, only include jobs with Arabic name
        return job.nameAr && job.nameAr.trim();
      })
    : jobs.filter(job => {
        // Always include the selected job
        if (job.id === jobId) return true;
        // Otherwise, only include jobs with English name
        return job.name && job.name.trim();
      });

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
      jobId: jobId,
      ratePerDay: ratePerDay ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        jobId: jobId,
        ratePerDay: ratePerDay ?? 0,
      });
    }
  }, [open, jobId, ratePerDay, form]);

  const onSubmit = async (values: JobFormValues) => {
    startTransition(async () => {
      // Ensure ratePerDay is a number (z.coerce handles string to number conversion)
      const ratePerDay = typeof values.ratePerDay === 'number' ? values.ratePerDay : Number(values.ratePerDay) || 0;
      const result = await updateEventJob(eventJobRequirementId, ratePerDay);
      if (result?.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        showErrorSwal(result?.error || 'Failed to update job', locale);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تعديل الوظيفة' : 'Edit Job'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'قم بتعديل المعدل اليومي للوظيفة'
              : 'Update the rate per day for this job'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobId">
              {isArabic ? 'الوظيفة' : 'Job'}
            </Label>
            <select
              id="jobId"
              className="w-full border rounded-md h-10 px-3 text-sm bg-muted cursor-not-allowed"
              {...form.register('jobId')}
              disabled
              defaultValue={jobId}
            >
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isArabic
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isArabic
                ? 'حفظ'
                : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

