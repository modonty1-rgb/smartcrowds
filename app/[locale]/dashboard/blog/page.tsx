import { BlogListContent } from './components/BlogListContent';

interface DashboardBlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardBlogPage({
  params,
  searchParams,
}: DashboardBlogPageProps) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  return <BlogListContent locale={locale} currentPage={currentPage} />;
}

