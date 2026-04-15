'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deleteJob } from '@/app/actions/jobs/actions';
import { useRouter } from '@/lib/routing';
import { showErrorSwal, showSuccessSwal } from '@/lib/utils/swal';

interface JobCardProps {
  job: {
    id: string;
    name: string;
    nameAr?: string | null;
    description?: string | null;
  };
  locale: string;
}

export function JobCard({ job, locale }: JobCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const t = (en: string, ar: string) => (isArabic ? ar : en);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteJob(job.id);
        showSuccessSwal(
          isArabic ? 'تم حذف الوظيفة بنجاح' : 'Job deleted successfully',
          locale
        );
        router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : isArabic
            ? 'فشل حذف الوظيفة'
            : 'Failed to delete job';

        // Check if error is about job being in use
        if (
          error instanceof Error &&
          error.message.includes('Job is in use by events')
        ) {
          showErrorSwal(
            isArabic
              ? 'لا يمكن حذف هذه الوظيفة لأنها مستخدمة في فعالية واحدة أو أكثر'
              : 'Cannot delete this job because it is used in one or more events',
            locale
          );
        } else {
          showErrorSwal(errorMessage, locale);
        }
      }
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="space-y-2">
          {job.nameAr && (
            <CardTitle className="text-lg font-semibold">
              {job.nameAr}
            </CardTitle>
          )}
          {job.name && (
            <div
              className={`text-base font-medium text-muted-foreground ${
                job.nameAr ? '' : 'text-lg font-semibold'
              }`}
            >
              {job.name}
            </div>
          )}
          {!job.nameAr && !job.name && (
            <CardTitle className="text-lg font-semibold">Untitled</CardTitle>
          )}
        </div>
      </CardHeader>
      {job.description && (
        <CardContent className="flex-1">
          <CardDescription className="line-clamp-3">
            {job.description}
          </CardDescription>
        </CardContent>
      )}
      <CardContent className="pt-0 space-y-2">
        <Link href={`./jobs/${job.id}/edit`}>
          <Button variant="outline" size="sm" className="w-full">
            {t('Edit', 'تعديل')}
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('Delete', 'حذف')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('Confirm Delete', 'تأكيد الحذف')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isArabic
                  ? 'هل أنت متأكد من حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء. إذا كانت الوظيفة مستخدمة في أي فعالية، لن يتم الحذف.'
                  : 'Are you sure you want to delete this job? This action cannot be undone. If the job is used in any event, deletion will not be allowed.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {t('Cancel', 'إلغاء')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {isPending
                  ? t('Deleting...', 'جاري الحذف...')
                  : t('Delete', 'حذف')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

