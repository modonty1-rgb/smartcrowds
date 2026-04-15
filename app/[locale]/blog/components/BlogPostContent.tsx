import { ReadingTime } from '@/components/blog/ReadingTime';
import { getPostBySlug, getPosts } from '../actions/actions';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { calculateReadingTime } from '@/lib/utils/blog';
import { Link } from '@/lib/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlogPostContentProps {
  locale: string;
  slug: string;
}

export async function BlogPostContent({ locale, slug }: BlogPostContentProps) {
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const isArabic = locale === 'ar';
  const title = isArabic && post.titleAr ? post.titleAr : post.title;
  const content = isArabic && post.contentAr ? post.contentAr : post.content;
  const readingTime = post.readingTime || calculateReadingTime(content);

  const { posts: relatedPosts } = await getPosts({
    locale,
    limit: 3,
  });

  const related = relatedPosts
    .filter((p: any) => p.id !== post.id)
    .slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: post.excerpt || post.seoDescription,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SMART CROWD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <main className="min-h-screen">
        <article className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author.name}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                <ReadingTime minutes={readingTime} locale={locale} />
              </div>

              {post.featuredImage && (
                <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                </div>
              )}
            </header>

            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <div className="mt-12 text-center">
              <Card className="inline-block max-w-3xl">
                <CardContent className="py-8 px-6 space-y-4">
                  <h2 className="text-2xl font-semibold">
                    {isArabic ? 'تريد معرفة المزيد؟' : 'Want to learn more?'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isArabic
                      ? 'لديك أسئلة أو تريد التواصل معنا؟ اتصل بنا اليوم.'
                      : 'Have questions or want to get in touch? Contact us today.'}
                  </p>
                  <Button asChild>
                    <Link href="/contact">
                      {isArabic ? 'اتصل بنا' : 'Contact Us'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {related.length > 0 && (
              <section className="mt-16 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">
                  {isArabic ? 'مقالات ذات صلة' : 'Related Articles'}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {related.map((relatedPost: any) => (
                    <div key={relatedPost.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <Link href={`/blog/${relatedPost.slug}`} className="block">
                        <h3 className="font-bold mb-2 line-clamp-2">
                          {isArabic && relatedPost.titleAr
                            ? relatedPost.titleAr
                            : relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {isArabic && relatedPost.excerptAr
                              ? relatedPost.excerptAr
                              : relatedPost.excerpt}
                          </p>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
    </>
  );
}

