import { Hero } from './Hero';
import { ServicesPreview } from './ServicesPreview';
import { FeaturedProjects } from './FeaturedProjects';
import ClientsGrid from './ClientsGrid';

interface HomeContentProps {
  featuredProjects: Array<{
    id: string;
    name: string;
    nameAr?: string | null;
    slug: string;
    description?: string | null;
    descriptionAr?: string | null;
    featuredImage?: string | null;
    locale: string;
  }>;
  locale: string;
}

export function HomeContent({ featuredProjects, locale }: HomeContentProps) {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <FeaturedProjects projects={featuredProjects} locale={locale} />
      {/* Clients logos */}
      <ClientsGrid locale={locale} />
    </>
  );
}

