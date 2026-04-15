'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { deleteProject } from '../actions/actions';
import { useRouter } from '@/lib/routing';
import { showErrorSwal, showSuccessSwal } from '@/lib/utils/swal';

interface DeleteProjectButtonProps {
  projectId: string;
  projectName?: string | null;
  locale: string;
}

export function DeleteProjectButton({ projectId, projectName, locale }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(projectId);

      if (!result?.success) {
        showErrorSwal(
          result?.error || (isArabic ? 'فشل حذف المشروع' : 'Failed to delete project'),
          locale,
        );
        return;
      }

      showSuccessSwal(
        isArabic ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully',
        locale,
      );
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => !isPending && setOpen(value)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive focus:text-destructive"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isArabic ? 'حذف المشروع' : 'Delete project'}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArabic ? 'تأكيد حذف المشروع' : 'Confirm project deletion'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArabic
              ? `هل أنت متأكد من حذف${projectName ? ` «${projectName}»` : ''}؟ لا يمكن التراجع عن هذه الخطوة.`
              : `Are you sure you want to delete${projectName ? ` “${projectName}”` : ''}? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isArabic ? 'جاري الحذف...' : 'Deleting...'}
              </span>
            ) : (
              <>{isArabic ? 'حذف' : 'Delete'}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

