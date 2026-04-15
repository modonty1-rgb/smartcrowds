'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateEventRequirements } from '@/app/actions/events/actions';
import { useRouter } from '@/lib/routing';
import { showErrorSwal } from '@/lib/utils/swal';

const requirementSchema = z.object({
  name: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

interface EditRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement: { name: string; nameAr: string };
  requirementIndex: number;
  allRequirements: Array<{ name: string; nameAr: string }>;
  eventId: string;
  locale: string;
}

export function EditRequirementDialog({
  open,
  onOpenChange,
  requirement,
  requirementIndex,
  allRequirements,
  eventId,
  locale,
}: EditRequirementDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isArabic = locale === 'ar';

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      name: requirement.name,
      nameAr: requirement.nameAr,
    },
  });

  const onSubmit = async (values: RequirementFormValues) => {
    const updatedRequirements = [...allRequirements];
    updatedRequirements[requirementIndex] = values;

    startTransition(async () => {
      const result = await updateEventRequirements(eventId, updatedRequirements);
      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        showErrorSwal(result.error || 'Failed to update requirement', locale);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تعديل المتطلب' : 'Edit Requirement'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'قم بتعديل المتطلب بالعربية والإنجليزية'
              : 'Update the requirement in Arabic and English'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr">
              {isArabic ? 'الاسم بالعربية' : 'Name (Arabic)'}
            </Label>
            <Textarea
              id="nameAr"
              {...form.register('nameAr')}
              placeholder={isArabic ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
              rows={3}
            />
            {form.formState.errors.nameAr && (
              <p className="text-sm text-red-600">
                {form.formState.errors.nameAr.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name (English)</Label>
            <Textarea
              id="name"
              {...form.register('name')}
              placeholder="Enter English name"
              rows={3}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
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

