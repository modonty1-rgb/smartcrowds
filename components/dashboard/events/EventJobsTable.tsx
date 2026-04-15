'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EditJobDialog } from './EditJobDialog';
import { Edit2, Trash2 } from 'lucide-react';
import { removeEventJob } from '@/app/actions/events/actions';
import { useRouter } from '@/lib/routing';
import { showErrorSwal } from '@/lib/utils/swal';

interface EventJobsTableProps {
  eventJobs: Array<{
    id: string;
    jobId: string;
    ratePerDay: number | null;
    job: { id: string; name: string; nameAr?: string | null };
  }>;
  jobs: { id: string; name: string; nameAr?: string | null }[];
  eventId: string;
  locale: string;
}

export function EventJobsTable({
  eventJobs,
  jobs,
  eventId,
  locale,
}: EventJobsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleDelete = async (eventJobRequirementId: string) => {
    startTransition(async () => {
      const result = await removeEventJob(eventJobRequirementId);
      if (result?.success) {
        router.refresh();
      } else {
        showErrorSwal(result?.error || 'Failed to delete job', locale);
      }
    });
  };

  const editingJob = eventJobs.find((ej) => ej.id === editingId);

  if (eventJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'الوظائف' : 'Jobs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {isArabic
              ? 'لا توجد وظائف مضافة'
              : 'No jobs added'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'الوظائف' : 'Jobs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'الاسم بالعربية' : 'Arabic Name'}
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  English Name
                </TableHead>
                <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                  {isArabic ? 'المعدل اليومي' : 'Rate per Day'}
                </TableHead>
                <TableHead className="text-right">
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventJobs.map((eventJob) => (
                <TableRow key={eventJob.id}>
                  <TableCell className={`font-medium ${isArabic ? 'text-right' : 'text-left'}`}>
                    {eventJob.job.nameAr || '-'}
                  </TableCell>
                  <TableCell className={isArabic ? 'text-right' : 'text-left'}>
                    {eventJob.job.name || '-'}
                  </TableCell>
                  <TableCell className={isArabic ? 'text-right' : 'text-left'}>
                    {eventJob.ratePerDay != null ? eventJob.ratePerDay.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingId(eventJob.id)}
                        title={isArabic ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={isArabic ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {isArabic
                                ? 'هل أنت متأكد من حذف هذه الوظيفة؟ لا يمكن التراجع عن هذا الإجراء.'
                                : 'Are you sure you want to delete this job? This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {isArabic ? 'إلغاء' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(eventJob.id)}
                              disabled={isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isPending
                                ? isArabic
                                  ? 'جاري الحذف...'
                                  : 'Deleting...'
                                : isArabic
                                ? 'حذف'
                                : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingJob && (
        <EditJobDialog
          open={editingId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingId(null);
          }}
          eventJobRequirementId={editingJob.id}
          jobId={editingJob.jobId}
          ratePerDay={editingJob.ratePerDay}
          jobs={jobs}
          locale={locale}
        />
      )}
    </>
  );
}

