import { HomeContent } from './homepage/components/HomeContent';
import { getFeaturedProjects } from './homepage/actions/getFeaturedProjects';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const featuredProjects = await getFeaturedProjects(locale);

  return (
    <HomeContent featuredProjects={featuredProjects} locale={locale} />
  );
}

