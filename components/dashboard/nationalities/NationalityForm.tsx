'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { updateNationality } from '@/app/actions/nationalities/actions';
import { useTransition } from 'react';
import { showErrorSwal } from '@/lib/utils/swal';

const schema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
});

export function NationalityForm({
  id,
  nameAr,
  nameEn,
  locale,
}: {
  id: string;
  nameAr: string;
  nameEn: string;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nameAr, nameEn },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    startTransition(async () => {
        const result = await updateNationality(id, values);
        if (result.success) {
          router.push(`/${locale}/dashboard/nationalities`);
        } else {
          showErrorSwal(result.error || (locale === 'ar' ? 'فشل تحديث الجنسية' : 'Failed to update nationality'), locale);
        }
    });
  };

  return (
    <section className="space-y-4 max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</label>
          <Input {...register('nameAr')} />
          {errors.nameAr && <p className="text-sm text-red-600 mt-1">{errors.nameAr.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</label>
          <Input {...register('nameEn')} />
          {errors.nameEn && <p className="text-sm text-red-600 mt-1">{errors.nameEn.message}</p>}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ' : 'Save')}
        </Button>
      </form>
    </section>
  );
}

