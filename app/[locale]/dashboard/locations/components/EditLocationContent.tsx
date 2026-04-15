import { LocationForm } from '@/components/dashboard/locations/LocationForm';
import { getLocation } from '../actions/actions';

interface EditLocationContentProps {
  locationId: string;
  locale: string;
}

export async function EditLocationContent({ locationId, locale }: EditLocationContentProps) {
  const loc = await getLocation(locationId);
  if (!loc) return <p className="text-muted-foreground">Not found</p>;
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{locale === 'ar' ? 'تعديل موقع' : 'Edit Location'}</h1>
      <LocationForm
        id={loc.id}
        city={loc.city}
        address={loc.address || ''}
        locale={locale}
      />
    </>
  );
}

