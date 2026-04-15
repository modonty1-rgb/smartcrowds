import { Link } from '@/lib/routing';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
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
  locale: string;
}

export function PostCard({ post, locale }: PostCardProps) {
  const isArabic = locale === 'ar';
  const title = isArabic && post.titleAr ? post.titleAr : post.title;
  const excerpt = isArabic && post.excerptAr ? post.excerptAr : post.excerpt;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        {post.featuredImage && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
          {excerpt && (
            <p className="text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author.name}</span>
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
            {post.readingTime && post.readingTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}























