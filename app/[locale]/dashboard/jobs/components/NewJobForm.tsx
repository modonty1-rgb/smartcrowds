'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createJob } from '../actions/actions';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const schema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional().default('')
});

export function NewJobForm() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', nameAr: '', description: '' } });

  const onSubmit = async (values: z.input<typeof schema>) => {
    await createJob(values);
    router.push(`/${locale}/dashboard/jobs`);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{isArabic ? 'إنشاء وظيفة' : 'Create Job'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">{isArabic ? 'الاسم' : 'Name (Arabic)'}</label>
          <Input {...register('nameAr')} />
          {errors.nameAr && <p className="text-sm text-red-600 mt-1">{errors.nameAr.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        {/* Description field hidden for now */}
        <div className="hidden">
          <label className="block text-sm font-medium mb-1">{isArabic ? 'الوصف' : 'Description'}</label>
          <Textarea rows={4} {...register('description')} />
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}</Button>
      </form>
    </section>
  );
}

