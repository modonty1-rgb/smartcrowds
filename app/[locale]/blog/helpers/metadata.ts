import type { Metadata } from 'next';
import { getPostBySlug } from '../actions/actions';

export async function generateBlogMetadata(
  locale: string
): Promise<Metadata> {
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'المدونة - SMART CROWD' : 'Blog - SMART CROWD',
    description: isArabic
      ? 'اكتشف مقالاتنا حول إدارة الحشود وتنظيم الفعاليات'
      : 'Discover our articles about crowd management and event organization',
    openGraph: {
      title: isArabic ? 'المدونة - SMART CROWD' : 'Blog - SMART CROWD',
      description: isArabic
        ? 'اكتشف مقالاتنا حول إدارة الحشود وتنظيم الفعاليات'
        : 'Discover our articles about crowd management and event organization',
    },
  };
}

export async function generateBlogPostMetadata(
  locale: string,
  slug: string
): Promise<Metadata> {
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const isArabic = locale === 'ar';
  const title = isArabic && post.titleAr ? post.titleAr : post.title;
  const description =
    isArabic && post.excerptAr
      ? post.excerptAr
      : post.excerpt || post.seoDescription || '';

  return {
    title: post.seoTitle || title,
    description: post.seoDescription || description,
    keywords: post.keywords,
    openGraph: {
      title: post.seoTitle || title,
      description: post.seoDescription || description,
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || title,
      description: post.seoDescription || description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

