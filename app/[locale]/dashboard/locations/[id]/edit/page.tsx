import { EditLocationContent } from '../../components/EditLocationContent';

export default async function EditLocationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  return <EditLocationContent locationId={id} locale={locale} />;
}


