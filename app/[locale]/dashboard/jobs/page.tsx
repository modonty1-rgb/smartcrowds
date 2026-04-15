import { JobsListContent } from './components/JobsListContent';

export const dynamic = 'force-dynamic';

export default async function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <JobsListContent locale={locale} />;
}


