'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddImage from '@/components/AddImage';
import { updateEvent } from '@/app/actions/events/actions';
import { useRouter } from '@/lib/routing';

interface EditEventFormProps {
  event: {
    id: string;
    title?: string;
    titleAr?: string | null;
    description?: string;
    descriptionAr?: string | null;
    date: string | Date;
    imageUrl?: string | null;
    locationId?: string | null;
    acceptJobs?: boolean | null;
    published?: boolean | null;
  };
  locations: Array<{ id: string; city: string; address?: string | null }>;
  locale: string;
}

export function EditEventForm({ event, locations, locale }: EditEventFormProps) {
  const router = useRouter();
  const isArabic = locale === 'ar';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: event.title || '',
    titleAr: event.titleAr || '',
    description: event.description || '',
    descriptionAr: event.descriptionAr || '',
    date: new Date(event.date).toISOString().split('T')[0],
    imageUrl: event.imageUrl || '',
    locationId: event.locationId || '',
    acceptJobs: Boolean(event.acceptJobs),
    published: Boolean(event.published),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateEvent(event.id, form);
    setSaving(false);
    if (result?.success) {
      router.push('/dashboard/events');
    } else if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'تعديل الفعالية' : 'Edit Event'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titleAr">
              {isArabic ? 'العنوان بالعربية' : 'Title (Arabic)'}
            </Label>
            <Input
              id="titleAr"
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
              placeholder={isArabic ? 'أدخل العنوان بالعربية' : 'Enter Arabic title'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (English)</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter English title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{isArabic ? 'التاريخ' : 'Date'}</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">
                {isArabic ? 'الموقع' : 'Location'}
              </Label>
              <select
                id="locationId"
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full border rounded-md h-10 px-3 text-sm"
              >
                <option value="">
                  {isArabic ? 'اختر الموقع' : 'Select location'}
                </option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.city}
                    {l.address ? ` - ${l.address}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionAr">
              {isArabic ? 'الوصف بالعربية' : 'Description (Arabic)'}
            </Label>
            <Textarea
              id="descriptionAr"
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              placeholder={isArabic ? 'أدخل الوصف بالعربية' : 'Enter Arabic description'}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter English description"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{isArabic ? 'الصورة' : 'Image'}</Label>
            <AddImage
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              uploadOnly={true}
              table="events"
              tableField="imageUrl"
              folder="events"
              autoUpload={true}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                id="acceptJobs"
                type="checkbox"
                checked={form.acceptJobs}
                onChange={(e) => setForm({ ...form, acceptJobs: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="acceptJobs" className="cursor-pointer">
                {isArabic ? 'السماح بقبول الوظائف' : 'Accept Jobs'}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="published" className="cursor-pointer">
                {isArabic ? 'منشور' : 'Published'}
              </Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}



