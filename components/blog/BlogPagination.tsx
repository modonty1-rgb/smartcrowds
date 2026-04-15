import { Link } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  locale: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = '/blog',
  locale,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage === 1}
      >
        <Link
          href={currentPage === 1 ? '#' : `${basePath}?page=${currentPage - 1}`}
          className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className={locale === 'ar' ? 'ml-0 mr-1' : 'mr-0 ml-1'}>
            {locale === 'ar' ? 'السابق' : 'Previous'}
          </span>
        </Link>
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?page=1`}>1</Link>
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <Link href={`${basePath}?page=${page}`}>{page}</Link>
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?page=${totalPages}`}>{totalPages}</Link>
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage === totalPages}
      >
        <Link
          href={currentPage === totalPages ? '#' : `${basePath}?page=${currentPage + 1}`}
          className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
        >
          <span className={locale === 'ar' ? 'mr-0 ml-1' : 'ml-0 mr-1'}>
            {locale === 'ar' ? 'التالي' : 'Next'}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}






















