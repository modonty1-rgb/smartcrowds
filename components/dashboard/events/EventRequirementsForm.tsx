'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { updateEventRequirements } from '@/app/actions/events/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

const requirementSchema = z.object({
  name: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

interface EventRequirementsFormProps {
  eventId: string;
  currentRequirements: Array<{ name: string; nameAr: string }>;
  locale: string;
}

export function EventRequirementsForm({
  eventId,
  currentRequirements,
  locale,
}: EventRequirementsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isArabic = locale === 'ar';

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      name: '',
      nameAr: '',
    },
  });

  const onSubmit = async (values: RequirementFormValues) => {
    const updatedRequirements = [...currentRequirements, values];

    startTransition(async () => {
      const result = await updateEventRequirements(eventId, updatedRequirements);
      if (result.success) {
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        showErrorSwal(result.error || 'Failed to add requirement', locale);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة متطلب جديد' : 'Add New Requirement'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'إضافة متطلب جديد' : 'Add New Requirement'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'أدخل المتطلب بالعربية والإنجليزية'
              : 'Enter the requirement in Arabic and English'}
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
                : 'Add Requirement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
