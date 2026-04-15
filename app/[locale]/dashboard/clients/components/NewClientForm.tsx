'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validations/client';
import { createClient } from '@/app/actions/clients/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';
import { showSuccessSwal } from '@/lib/utils/swal';
import AddImage from '@/components/AddImage';

type FormValues = z.infer<typeof clientSchema>;

export function NewClientForm() {
  const [submitting, setSubmitting] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', logoUrl: '', websiteUrl: '', published: false, order: 0 },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createClient({ ...values, websiteUrl: values.websiteUrl || undefined });
    setSubmitting(false);
    if ((res as { success?: boolean })?.success) {
      await showSuccessSwal(locale === 'ar' ? 'تم حفظ العميل بنجاح' : 'Client saved successfully', locale);
      router.push('/dashboard/clients');
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 max-w-xl">
      <div>
        <Label htmlFor="name">{isArabic ? 'اسم العميل' : 'Name'}</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>{isArabic ? 'الشعار' : 'Logo'}</Label>
        <AddImage
          table="clients"
          uploadOnly
          onChange={(url) => form.setValue('logoUrl', url, { shouldValidate: true })}
          value={form.watch('logoUrl')}
          imageFit="contain"
        />
        {form.formState.errors.logoUrl && (
          <p className="text-sm text-red-600">{form.formState.errors.logoUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="websiteUrl">{isArabic ? 'الموقع (اختياري)' : 'Website (optional)'}</Label>
        <Input id="websiteUrl" placeholder={isArabic ? 'https://مثال.السعودية' : 'https://example.com'} {...form.register('websiteUrl')} />
        {form.formState.errors.websiteUrl && (
          <p className="text-sm text-red-600">{form.formState.errors.websiteUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="order">{isArabic ? 'الترتيب' : 'Order'}</Label>
        <Input id="order" type="number" min={0} {...form.register('order', { valueAsNumber: true })} />
        {form.formState.errors.order && (
          <p className="text-sm text-red-600">{form.formState.errors.order.message as string}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input id="published" type="checkbox" {...form.register('published')} />
        <Label htmlFor="published">{isArabic ? 'نشر' : 'Published'}</Label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
      </Button>
    </form>
  );
}


