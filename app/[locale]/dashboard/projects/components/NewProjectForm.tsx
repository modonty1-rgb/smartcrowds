'use client';

import { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';
import { createProject, addProjectImage } from '../actions/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddImage from '@/components/AddImage';
import { SEOFields } from '@/components/dashboard/blog/SEOFields';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { generateSlug } from '../helpers/utils';
import { showSuccessSwal } from '@/lib/utils/swal';

export function NewProjectForm() {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isArabic = locale === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    featuredImage: '',
    published: false,
    featured: false,
    locale: locale,
    seoTitle: '',
    seoDescription: '',
    keywords: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields based on current locale
    if (isArabic) {
      if (!formData.nameAr.trim()) {
        alert('يرجى إدخال اسم المشروع');
        return;
      }
      if (!formData.descriptionAr.trim()) {
        alert('يرجى إدخال وصف المشروع');
        return;
      }
    } else {
      if (!formData.name.trim()) {
        alert('Please enter the project name');
        return;
      }
      if (!formData.description.trim()) {
        alert('Please enter the project description');
        return;
      }
    }

    setLoading(true);

    try {
      // Ensure both name and nameAr are sent (even if empty)
      // Ensure slug is generated if not already set
      const finalSlug = formData.slug?.trim() || generateSlug(
        isArabic && formData.nameAr 
          ? formData.nameAr 
          : formData.name || ''
      ) || ''; // Will be handled by server action if empty
      
      const submitData = {
        ...formData,
        name: formData.name || '',
        nameAr: formData.nameAr || '',
        slug: finalSlug,
        locale: locale as 'ar' | 'en',
        featuredImage: formData.featuredImage && formData.featuredImage.trim() ? formData.featuredImage : undefined,
      };

      const result = await createProject(submitData);

      if (result.success && result.project) {
        // Add all gallery images to the newly created project
        if (galleryImages.length > 0) {
          try {
            await Promise.all(
              galleryImages.map((imageUrl, index) =>
                addProjectImage(result.project!.id, {
                  imageUrl,
                  alt: '',
                  altAr: '',
                  order: index,
                })
              )
            );
          } catch (error) {
            console.error('Error adding gallery images:', error);
            // Continue even if gallery images fail - project is already created
          }
        }
        await showSuccessSwal(isArabic ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully', locale);
        router.push('/dashboard/projects');
      } else {
        const errorMessage = result.error || (isArabic ? 'فشل في إنشاء المشروع' : 'Failed to create project');
        console.error('Project creation error:', errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : (isArabic ? 'حدث خطأ أثناء إنشاء المشروع' : 'An error occurred while creating the project');
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {isArabic ? 'مشروع جديد' : 'New Project'}
          </h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/projects')}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isArabic
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isArabic
                  ? 'حفظ'
                  : 'Save'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'معلومات المشروع' : 'Project Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isArabic ? (
              <>
                <div>
                  <Label htmlFor="nameAr">
                    {isArabic ? 'اسم المشروع' : 'Project Name'} *
                  </Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => {
                      const newNameAr = e.target.value;
                      const newSlug = generateSlug(newNameAr);
                      setFormData({
                        ...formData,
                        nameAr: newNameAr,
                        slug: newSlug,
                      });
                    }}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="descriptionAr">
                    {isArabic ? 'الوصف' : 'Description'} *
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({ ...formData, descriptionAr: e.target.value })
                    }
                    rows={6}
                    required
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="name">
                    {isArabic ? 'اسم المشروع' : 'Project Name'} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const newSlug = generateSlug(newName);
                      setFormData({
                        ...formData,
                        name: newName,
                        slug: newSlug,
                      });
                    }}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    {isArabic ? 'الوصف' : 'Description'} *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={6}
                    required
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Removed start/end date fields per request */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الصورة الرئيسية' : 'Featured Image'}</CardTitle>
          </CardHeader>
          <CardContent>
            <AddImage
              value={formData.featuredImage}
              onChange={(url: string) => setFormData({ ...formData, featuredImage: url })}
              uploadOnly={true}
              table="projects"
              tableField="featuredImage"
              folder="projects"
              autoUpload={true}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'معرض الصور' : 'Image Gallery'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{isArabic ? 'إضافة صور للمعرض' : 'Add Images to Gallery'}</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {isArabic
                  ? 'يمكنك إضافة عدة صور مرة واحدة، وسيتم حفظها تلقائياً عند إنشاء المشروع'
                  : 'You can add multiple images at once, they will be saved automatically when you create the project'}
              </p>
              
              <div className="space-y-3">
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    setUploadingImages(true);
                    const uploadPromises = files.map((file, i) => {
                      const fileIndex = galleryImages.length + i;

                      return new Promise<string | null>((resolve) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('table', 'projects');
                        formData.append('uploadOnly', 'true');
                        formData.append('folder', 'projects/gallery');

                        const xhr = new XMLHttpRequest();
                        
                        xhr.upload.onprogress = (event) => {
                          if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setUploadProgress(prev => ({ ...prev, [fileIndex]: percent }));
                          }
                        };

                        xhr.onload = () => {
                          if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                              const data = JSON.parse(xhr.responseText);
                              const url = data.imageUrl || data.url || data.secure_url || data.image_url;
                              if (url) {
                                setUploadProgress(prev => ({ ...prev, [fileIndex]: 100 }));
                                resolve(url);
                              } else {
                                resolve(null);
                              }
                            } catch (err) {
                              console.error(`Error parsing response for image ${i + 1}:`, err);
                              resolve(null);
                            }
                          } else {
                            console.error(`Upload failed for image ${i + 1}:`, xhr.statusText);
                            resolve(null);
                          }
                        };

                        xhr.onerror = () => {
                          console.error(`Network error for image ${i + 1}`);
                          resolve(null);
                        };

                        xhr.open('POST', '/api/images');
                        xhr.send(formData);
                      });
                    });

                    const uploadedUrls = await Promise.all(uploadPromises);
                    const validUrls = uploadedUrls.filter((url): url is string => url !== null && !galleryImages.includes(url));

                    setGalleryImages([...galleryImages, ...validUrls]);
                    setUploadingImages(false);
                    setUploadProgress({});
                    
                    if (galleryInputRef.current) {
                      galleryInputRef.current.value = '';
                    }
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-full"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isArabic ? 'جاري الرفع...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {isArabic ? 'اختر صور متعددة' : 'Select Multiple Images'}
                    </>
                  )}
                </Button>

                {uploadingImages && Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([index, progress]) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{isArabic ? `صورة ${parseInt(index) + 1}` : `Image ${parseInt(index) + 1}`}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-200"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div>
                <Label className="mb-2 block">
                  {isArabic ? 'الصور المضافة' : 'Added Images'} ({galleryImages.length})
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {galleryImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden border-2 border-border">
                        <Image
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryImages(galleryImages.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive/90"
                          aria-label={isArabic ? 'حذف الصورة' : 'Remove image'}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'SEO' : 'SEO Settings'}</CardTitle>
          </CardHeader>
          <CardContent>
            <SEOFields
              seoTitle={formData.seoTitle}
              seoDescription={formData.seoDescription}
              keywords={formData.keywords}
              onSeoTitleChange={(value) =>
                setFormData({ ...formData, seoTitle: value })
              }
              onSeoDescriptionChange={(value) =>
                setFormData({ ...formData, seoDescription: value })
              }
              onKeywordsChange={(keywords) =>
                setFormData({ ...formData, keywords })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الإعدادات' : 'Settings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="published" className="cursor-pointer">
                {isArabic ? 'نشر فوراً' : 'Publish immediately'}
              </Label>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

