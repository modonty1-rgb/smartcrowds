import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { listLocations } from '../actions/actions';

interface LocationsListContentProps {
  locale: string;
}

export async function LocationsListContent({ locale }: LocationsListContentProps) {
  type LocationItem = { id: string; city: string; address?: string | null };
  const locations = (await listLocations()) as unknown as LocationItem[];
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('Locations', 'المواقع')}</h1>
        <Link href={`./locations/new`}>
          <Button>{t('Create Location', 'إنشاء موقع')}</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {locations.map((loc: LocationItem) => (
          <div key={loc.id} className="flex items-center justify-between border rounded-md p-3">
            <div>
              <div className="font-medium">{loc.city}</div>
              {loc.address ? <div className="text-sm text-muted-foreground">{loc.address}</div> : null}
            </div>
            <div className="flex gap-2">
              <Link href={`./locations/${loc.id}/edit`}>
                <Button variant="outline" size="sm">{t('Edit', 'تعديل')}</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

