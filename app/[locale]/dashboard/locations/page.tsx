import { LocationsListContent } from './components/LocationsListContent';

export const dynamic = 'force-dynamic';

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LocationsListContent locale={locale} />;
}


