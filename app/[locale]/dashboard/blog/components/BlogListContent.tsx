import { Link } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Eye, Clock, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { getPosts } from '../actions/actions';
import { DeleteBlogPostButton } from './DeleteBlogPostButton';

type DashboardPost = {
  id: string;
  title?: string | null;
  titleAr?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  excerptAr?: string | null;
  featuredImage?: string | null;
  author?: { name: string } | null;
  published?: boolean | null;
  publishedAt?: string | Date | null;
  locale?: 'en' | 'ar' | string;
  readingTime?: number | null;
};

interface BlogListContentProps {
  locale: string;
  currentPage: number;
}

export async function BlogListContent({ locale, currentPage }: BlogListContentProps) {
  const result = await getPosts({
    locale: locale.toLowerCase().trim(), // Filter posts by current route locale (normalized)
    published: undefined, // Show all posts (published and drafts)
    page: currentPage,
    limit: 20,
  });

  const pagination = (result && result.pagination) || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const posts: DashboardPost[] = (result?.posts as unknown[]) as DashboardPost[] || [];

  const isArabic = locale === 'ar';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'إدارة المدونة' : 'Blog Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة وتحرير المقالات'
              : 'Manage and edit blog posts'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'مقال جديد' : 'New Post'}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isArabic ? 'المقالات' : 'Posts'}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {pagination.total} {isArabic ? 'مقال' : 'posts'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {isArabic
                ? 'لا توجد مقالات بعد'
                : 'No posts yet. Create your first post!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post: DashboardPost) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Featured Image */}
                  {post.featuredImage ? (
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={post.featuredImage}
                        alt={post.titleAr || post.title || 'Post image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Status Badge Overlay */}
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                        <div>
                          {!post.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/90 text-yellow-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مسودة' : 'Draft'}
                            </span>
                          )}
                          {post.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/90 text-green-950 rounded backdrop-blur-sm flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {isArabic ? 'منشور' : 'Published'}
                            </span>
                          )}
                        </div>
                        {/* Locale Badge on Image */}
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded backdrop-blur-sm border ${post.locale === 'ar'
                              ? 'bg-blue-600/90 text-white border-blue-700'
                              : 'bg-purple-600/90 text-white border-purple-700'
                            }`}
                        >
                          {post.locale === 'ar' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                        <div>
                          {!post.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/90 text-yellow-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مسودة' : 'Draft'}
                            </span>
                          )}
                          {post.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-500/90 text-green-950 rounded backdrop-blur-sm flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {isArabic ? 'منشور' : 'Published'}
                            </span>
                          )}
                        </div>
                        {/* Locale Badge on Image */}
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded backdrop-blur-sm border ${post.locale === 'ar'
                              ? 'bg-blue-600/90 text-white border-blue-700'
                              : 'bg-purple-600/90 text-white border-purple-700'
                            }`}
                        >
                          {post.locale === 'ar' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {post.locale === 'ar' && post.titleAr
                        ? post.titleAr
                        : post.title || post.titleAr || 'Untitled'}
                    </h3>

                    {/* Excerpt */}
                    {(post.excerptAr || post.excerpt) && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.locale === 'ar' && post.excerptAr
                          ? post.excerptAr
                          : post.excerpt || post.excerptAr}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      {post.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{post.author.name}</span>
                        </div>
                      )}
                      {post.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readingTime} {isArabic ? 'دقيقة' : 'min'}</span>
                        </div>
                      )}
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>


                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/blog/${post.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          {isArabic ? 'تعديل' : 'Edit'}
                        </Link>
                      </Button>
                      {post.slug && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} locale={post.locale || 'en'}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <DeleteBlogPostButton
                        postId={post.id}
                        postTitle={post.locale === 'ar' && post.titleAr ? post.titleAr : post.title || 'Untitled'}
                        locale={locale}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/blog?page=${pageNum}`}>
                      {pageNum}
                    </Link>
                  </Button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

