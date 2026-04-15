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
import { EditRequirementDialog } from './EditRequirementDialog';
import { Edit2, Trash2 } from 'lucide-react';
import { updateEventRequirements } from '@/app/actions/events/actions';
import { useRouter } from '@/lib/routing';
import { showErrorSwal } from '@/lib/utils/swal';

interface EventRequirementsTableProps {
  requirements: Array<{ name: string; nameAr: string }>;
  eventId: string;
  locale: string;
}

export function EventRequirementsTable({
  requirements,
  eventId,
  locale,
}: EventRequirementsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleDelete = async (index: number) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);

    startTransition(async () => {
      const result = await updateEventRequirements(eventId, updatedRequirements);
      if (result.success) {
        router.refresh();
      } else {
        showErrorSwal(result.error || 'Failed to delete requirement', locale);
      }
    });
  };

  if (requirements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'المتطلبات' : 'Requirements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {isArabic
              ? 'لا توجد متطلبات مضافة'
              : 'No requirements added'}
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
            {isArabic ? 'المتطلبات' : 'Requirements'}
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
                <TableHead className="text-right">
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((requirement, index) => (
                <TableRow key={index}>
                  <TableCell className={`font-medium ${isArabic ? 'text-right' : 'text-left'}`}>
                    {requirement.nameAr || '-'}
                  </TableCell>
                  <TableCell className={isArabic ? 'text-right' : 'text-left'}>
                    {requirement.name || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingIndex(index)}
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
                                ? 'هل أنت متأكد من حذف هذا المتطلب؟ لا يمكن التراجع عن هذا الإجراء.'
                                : 'Are you sure you want to delete this requirement? This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {isArabic ? 'إلغاء' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(index)}
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

      {editingIndex !== null && (
        <EditRequirementDialog
          open={editingIndex !== null}
          onOpenChange={(open) => {
            if (!open) setEditingIndex(null);
          }}
          requirement={requirements[editingIndex]}
          requirementIndex={editingIndex}
          allRequirements={requirements}
          eventId={eventId}
          locale={locale}
        />
      )}
    </>
  );
}

