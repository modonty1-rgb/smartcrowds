import { EditJobContent } from '../../components/EditJobContent';

export default async function EditJobPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  return <EditJobContent jobId={id} locale={locale} />;
}

