import { BlogPostContent } from '../components/BlogPostContent';
import { generateBlogPostMetadata } from '../helpers/metadata';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // Decode URL-encoded slug (handles Arabic characters)
  const decodedSlug = decodeURIComponent(slug);
  return generateBlogPostMetadata(locale, decodedSlug);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  // Decode URL-encoded slug (handles Arabic characters)
  const decodedSlug = decodeURIComponent(slug);

  return <BlogPostContent locale={locale} slug={decodedSlug} />;
}
