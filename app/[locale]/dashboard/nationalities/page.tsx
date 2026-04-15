import { NationalitiesListContent } from './components/NationalitiesListContent';

export const dynamic = 'force-dynamic';

export default async function NationalitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <NationalitiesListContent locale={locale} />;
}

