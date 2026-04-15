'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventBasicSchema } from '@/lib/validations/event';
import { useTransition } from 'react';
import { createEvent } from '@/app/actions/events/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AddImage from '@/components/AddImage';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';

type FormValues = z.input<typeof eventBasicSchema>;

interface EventFormProps {
  locations: { id: string; city: string; address?: string | null }[];
  locale?: string;
}

export default function EventForm({ locations, locale }: EventFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const defaultLocale = useLocale();
  const currentLocale = locale || defaultLocale;
  const isArabic = currentLocale === 'ar';

  const form = useForm<FormValues>({
    resolver: zodResolver(eventBasicSchema),
    defaultValues: {
      title: '',
      titleAr: '',
      date: '',
      locationId: '',
      description: '',
      descriptionAr: '',
      imageUrl: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      await createEvent(values);
      router.push('/dashboard/events');
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="titleAr">
          {isArabic ? 'العنوان بالعربية' : 'Title (Arabic)'}
        </Label>
        <Input
          id="titleAr"
          {...register('titleAr')}
          placeholder={isArabic ? 'أدخل العنوان بالعربية' : 'Enter Arabic title'}
        />
        {errors.titleAr && (
          <p className="text-sm text-red-600 mt-1">{errors.titleAr.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (English)</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter English title"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{isArabic ? 'التاريخ' : 'Date'}</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && (
            <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationId">
            {isArabic ? 'الموقع' : 'Location'}
          </Label>
          <select
            id="locationId"
            className="w-full border rounded-md h-10 px-3 text-sm"
            {...register('locationId')}
            defaultValue=""
          >
            <option value="" disabled>
              {isArabic ? 'اختر الموقع' : 'Select location'}
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city}
                {loc.address ? ` - ${loc.address}` : ''}
              </option>
            ))}
          </select>
          {errors.locationId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.locationId.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionAr">
          {isArabic ? 'الوصف بالعربية' : 'Description (Arabic)'}
        </Label>
        <Textarea
          id="descriptionAr"
          {...register('descriptionAr')}
          placeholder={isArabic ? 'أدخل الوصف بالعربية' : 'Enter Arabic description'}
          rows={5}
        />
        {errors.descriptionAr && (
          <p className="text-sm text-red-600 mt-1">
            {errors.descriptionAr.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (English)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter English description"
          rows={5}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">{isArabic ? 'الصورة' : 'Image'}</Label>
        <AddImage
          table="events"
          uploadOnly
          value={form.watch('imageUrl')}
          onChange={(url) =>
            form.setValue('imageUrl', url, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          className="mt-2"
        />
        {errors.imageUrl && (
          <p className="text-sm text-red-600 mt-2">
            {errors.imageUrl.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? isArabic
            ? 'جاري الحفظ...'
            : 'Saving...'
          : isArabic
          ? 'إنشاء فعالية'
          : 'Create Event'}
      </Button>
    </form>
  );
}


