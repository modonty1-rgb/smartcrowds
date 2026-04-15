import { EditNationalityContent } from '../../components/EditNationalityContent';

export default async function EditNationalityPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  return <EditNationalityContent nationalityId={id} locale={locale} />;
}

