import { AboutContent } from './components/AboutContent';
import { generateAboutMetadata } from './helpers/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateAboutMetadata(locale);
}

export default async function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutContent />
    </div>
  );
}

