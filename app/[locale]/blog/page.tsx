import { BlogContent } from './components/BlogContent';
import { generateBlogMetadata } from './helpers/metadata';
import type { Metadata } from 'next';
import { Suspense } from 'react';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateBlogMetadata(locale);
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const isArabic = locale === 'ar';

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'المدونة' : 'Blog'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {isArabic
                ? 'اكتشف مقالاتنا حول إدارة الحشود وتنظيم الفعاليات'
                : 'Discover our articles about crowd management and event organization'}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            }
          >
            <BlogContent
              locale={locale}
              page={currentPage}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
