import { SubscribersListContent } from './components/SubscribersListContent';

export default async function AllSubscribersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SubscribersListContent locale={locale} />;
}

