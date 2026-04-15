'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const schema = z.object({
  city: z.string().min(1),
  address: z.string().optional().default(''),
});

export function LocationForm({
  id,
  city,
  address,
  locale,
}: {
  id?: string;
  city: string;
  address: string;
  locale: string;
}) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { city, address },
  });

  const onSubmit = async (values: z.input<typeof schema>) => {
    const endpoint = id ? `/api/locations/${id}` : `/api/locations/create`;
    const method = id ? 'PUT' : 'POST';
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    router.push(`/${locale}/dashboard/locations`);
  };

  return (
    <section className="space-y-4 max-w-xl">
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


