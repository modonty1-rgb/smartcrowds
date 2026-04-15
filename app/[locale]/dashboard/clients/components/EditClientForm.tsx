'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientSchema } from '@/lib/validations/client';
import { listClients, updateClient } from '@/app/actions/clients/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddImage from '@/components/AddImage';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';
import { showSuccessSwal } from '@/lib/utils/swal';

type FormValues = z.infer<typeof clientSchema>;
type ClientItem = { id: string; name: string; logoUrl: string; websiteUrl?: string | null; published: boolean; order: number };

export function EditClientForm({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', logoUrl: '', websiteUrl: '', published: false, order: 0 },
  });

  useEffect(() => {
    (async () => {
      const clients = (await listClients()) as unknown as ClientItem[];
      const client = clients.find((c: ClientItem) => c.id === id);
      if (client) {
        form.reset({
          name: client.name,
          logoUrl: client.logoUrl,
          websiteUrl: client.websiteUrl || '',
          published: client.published,
          order: client.order,
        });
      }
      setLoading(false);
    })();
  }, [id, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await updateClient(id, { ...values, websiteUrl: values.websiteUrl || undefined });
    setSubmitting(false);
    if ((res as { success?: boolean })?.success) {
      await showSuccessSwal(locale === 'ar' ? 'تم تحديث العميل بنجاح' : 'Client updated successfully', locale);
      router.push('/dashboard/clients');
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 max-w-xl">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Logo</Label>
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
        <Label htmlFor="websiteUrl">Website (optional)</Label>
        <Input id="websiteUrl" placeholder="https://example.com" {...form.register('websiteUrl')} />
        {form.formState.errors.websiteUrl && (
          <p className="text-sm text-red-600">{form.formState.errors.websiteUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="order">Order</Label>
        <Input id="order" type="number" min={0} {...form.register('order', { valueAsNumber: true })} />
        {form.formState.errors.order && (
          <p className="text-sm text-red-600">{form.formState.errors.order.message as string}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input id="published" type="checkbox" {...form.register('published')} />
        <Label htmlFor="published">Published</Label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}


