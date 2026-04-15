import { PostCard } from '@/components/blog/PostCard';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { getPosts } from '../actions/actions';

type PostWithAuthor = {
  id: string;
  title: string;
  titleAr?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptAr?: string | null;
  featuredImage?: string | null;
  publishedAt?: Date | null;
  author: {
    name: string;
  };
  readingTime?: number | null;
  locale: string;
};

interface BlogContentProps {
  locale: string;
  page: number;
}

export async function BlogContent({
  locale,
  page,
}: BlogContentProps) {
  const { posts, pagination } = await getPosts({
    locale,
    page,
    limit: 12,
  });

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          {locale === 'ar' ? 'لا توجد مقالات متاحة' : 'No posts available'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: PostWithAuthor) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <BlogPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          locale={locale}
        />
      )}
    </>
  );
}

