import { ProjectsContent } from './components/ProjectsContent';
import { generateProjectsMetadata } from './helpers/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateProjectsMetadata(locale);
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ProjectsContent locale={locale} />;
}
