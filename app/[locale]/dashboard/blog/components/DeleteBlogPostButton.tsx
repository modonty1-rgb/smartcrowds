'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deletePost } from '../actions/actions';

interface DeleteBlogPostButtonProps {
  postId: string;
  postTitle: string;
  locale: string;
}

export function DeleteBlogPostButton({
  postId,
  postTitle,
  locale,
}: DeleteBlogPostButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const isArabic = locale === 'ar';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      
      if (result.error) {
        alert(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(isArabic ? 'فشل حذف المقال' : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArabic ? 'تأكيد الحذف' : 'Delete Post'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArabic
              ? `هل أنت متأكد من حذف "${postTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting
              ? isArabic
                ? 'جاري الحذف...'
                : 'Deleting...'
              : isArabic
                ? 'حذف'
                : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

