'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';
import {
  getProjectById,
  addProjectImage,
  deleteProjectImage,
} from '../actions/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AddImage from '@/components/AddImage';
import { X, ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/routing';
import Image from 'next/image';

interface ProjectGalleryContentProps {
  projectId: string;
}

export function ProjectGalleryContent({ projectId }: ProjectGalleryContentProps) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const isArabic = locale === 'ar';

  useEffect(() => {
    const loadData = async () => {
      const project = await getProjectById(projectId);

      if (project) {
        const name = isArabic && project.nameAr ? project.nameAr : project.name || 'Untitled';
        setProjectName(name);
        setGalleryImages(project.images || []);
      }

      setLoading(false);
    };

    loadData();
  }, [projectId, isArabic]);

  const handleAddGalleryImage = async (url: string) => {
    if (!projectId) return;
    const result = await addProjectImage(projectId, {
      imageUrl: url,
      alt: '',
      altAr: '',
      order: galleryImages.length,
    });

    if (result.success && result.image) {
      setGalleryImages([...galleryImages, result.image]);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    const result = await deleteProjectImage(imageId);
    if (result.success) {
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-center">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'معرض الصور' : 'Image Gallery'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'مشروع:' : 'Project:'} {projectName}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isArabic ? 'العودة إلى المشاريع' : 'Back to Projects'}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'إضافة صورة جديدة' : 'Add New Image'}</CardTitle>
        </CardHeader>
        <CardContent>
          <AddImage
            onChange={handleAddGalleryImage}
            uploadOnly={true}
            table="projects"
            folder="projects/gallery"
            autoUpload={true}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'الصور الحالية' : 'Current Images'} ({galleryImages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {galleryImages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {isArabic
                ? 'لا توجد صور في المعرض بعد. قم بإضافة صورة أعلاه.'
                : 'No images in gallery yet. Add an image above.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={image.alt || image.altAr || `Gallery image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={isArabic ? 'حذف الصورة' : 'Delete image'}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isArabic
                              ? 'هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.'
                              : 'Are you sure you want to delete this image? This action cannot be undone.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {isArabic ? 'إلغاء' : 'Cancel'}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGalleryImage(image.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isArabic ? 'حذف' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {isArabic ? 'صورة' : 'Image'} {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

