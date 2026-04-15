import { ContactMessagesContent } from './components/ContactMessagesContent';

export const dynamic = 'force-dynamic';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ContactMessagesContent locale={locale} />;
}

