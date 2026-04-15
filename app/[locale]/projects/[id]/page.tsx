import { ProjectDetailContent } from '../components/ProjectDetailContent';
import { generateProjectDetailMetadata } from '../helpers/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  // Decode URL-encoded slug (handles Arabic characters)
  // Note: parameter is named 'id' but it's actually a slug
  const decodedSlug = decodeURIComponent(id);
  return generateProjectDetailMetadata(locale, decodedSlug);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  // Decode URL-encoded slug (handles Arabic characters)
  // Note: parameter is named 'id' but it's actually a slug
  const decodedSlug = decodeURIComponent(id);

  return <ProjectDetailContent locale={locale} id={decodedSlug} />;
}
