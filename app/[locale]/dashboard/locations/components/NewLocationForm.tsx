'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLocation } from '../actions/actions';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const schema = z.object({
  city: z.string().min(1),
  address: z.string().optional().default(''),
});

export function NewLocationForm() {
  const locale = useLocale();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { city: '', address: '' } });

  const onSubmit = async (values: z.input<typeof schema>) => {
    await createLocation(values);
    router.push(`/${locale}/dashboard/locations`);
  };

  return (
    <section className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">{locale === 'ar' ? 'إنشاء موقع' : 'Create Location'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'المدينة' : 'City'}</label>
          <Input {...register('city')} />
          {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{locale === 'ar' ? 'العنوان' : 'Address'}</label>
          <Input {...register('address')} />
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ' : 'Save')}</Button>
      </form>
    </section>
  );
}

