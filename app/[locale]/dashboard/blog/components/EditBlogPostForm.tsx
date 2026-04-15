'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/lib/routing';
import {
  updatePost,
  getPostById,
} from '../actions/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddImage from '@/components/AddImage';
import { SEOFields } from '@/components/dashboard/blog/SEOFields';
import { TiptapEditor } from '@/components/dashboard/blog/TiptapEditor';
import { calculateReadingTime } from '@/lib/utils/blog';
import { generateSlug } from '../helpers/utils';

interface EditBlogPostFormProps {
  postId: string;
}

export function EditBlogPostForm({ postId }: EditBlogPostFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postLocale, setPostLocale] = useState<'ar' | 'en'>('ar');

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    slug: '',
    content: '',
    contentAr: '',
    excerpt: '',
    excerptAr: '',
    featuredImage: '',
    authorName: '',
    published: false,
    locale: locale as 'ar' | 'en',
    seoTitle: '',
    seoDescription: '',
    keywords: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      const post = await getPostById(postId);

      if (post) {
        const postLocaleValue = (post.locale === 'ar' || post.locale === 'en') ? post.locale : 'ar';
        setPostLocale(postLocaleValue);
        setFormData({
          title: post.title || '',
          titleAr: post.titleAr || '',
          slug: post.slug,
          content: post.content || '',
          contentAr: post.contentAr || '',
          excerpt: post.excerpt || '',
          excerptAr: post.excerptAr || '',
          featuredImage: post.featuredImage || '',
          authorName: post.author?.name || '',
          published: post.published,
          locale: postLocaleValue,
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          keywords: post.keywords || [],
        });
      }

      setLoading(false);
    };

    loadData();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const content = formData.contentAr || formData.content || '';
    const readingTime = calculateReadingTime(content);
    const result = await updatePost(postId, {
      ...formData,
      readingTime,
    });

    if (result.success) {
      router.push('/dashboard/blog');
    } else {
      alert(result.error || 'Failed to update post');
    }

    setSaving(false);
  };

  const isArabic = locale === 'ar';

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
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {isArabic ? 'تعديل المقال' : 'Edit Post'}
          </h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/blog')}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
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
            <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {postLocale === 'ar' ? (
              <>
                <div>
                  <Label htmlFor="titleAr">
                    {isArabic ? 'العنوان' : 'Title'} *
                  </Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) => {
                      const newTitleAr = e.target.value;
                      const newSlug = generateSlug(newTitleAr) || generateSlug(formData.title);
                      setFormData({
                        ...formData,
                        titleAr: newTitleAr,
                        slug: newSlug,
                      });
                    }}
                    required
                    className="mt-1"
                    placeholder={isArabic ? 'أدخل عنوان المقال' : 'Enter post title'}
                  />
                </div>

                <div>
                  <Label htmlFor="excerptAr">
                    {isArabic ? 'الملخص' : 'Excerpt'}
                  </Label>
                  <Textarea
                    id="excerptAr"
                    value={formData.excerptAr}
                    onChange={(e) =>
                      setFormData({ ...formData, excerptAr: e.target.value })
                    }
                    rows={3}
                    className="mt-1"
                    placeholder={isArabic ? 'ملخص قصير للمقال (اختياري)' : 'Short summary of the post (optional)'}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="title">
                    {isArabic ? 'العنوان' : 'Title'} *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const newSlug = generateSlug(formData.titleAr) || generateSlug(newTitle);
                      setFormData({
                        ...formData,
                        title: newTitle,
                        slug: newSlug,
                      });
                    }}
                    required
                    className="mt-1"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">
                    {isArabic ? 'الملخص' : 'Excerpt'}
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={3}
                    className="mt-1"
                    placeholder="Short summary of the post (optional)"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الصورة الرئيسية' : 'Featured Image'}</CardTitle>
          </CardHeader>
          <CardContent>
            <AddImage
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              uploadOnly={true}
              table="blog"
              tableField="featuredImage"
              folder="blog"
              autoUpload={true}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'المحتوى' : 'Content'} *</CardTitle>
          </CardHeader>
          <CardContent>
            {postLocale === 'ar' ? (
              <TiptapEditor
                content={formData.contentAr}
                onChange={(value) =>
                  setFormData({ ...formData, contentAr: value })
                }
                placeholder="ابدأ الكتابة..."
                className="mt-2"
              />
            ) : (
              <TiptapEditor
                content={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Start writing..."
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الإعدادات' : 'Settings'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="author">
                {isArabic ? 'المؤلف' : 'Author'} *
              </Label>
              <Input
                id="author"
                value={formData.authorName}
                onChange={(e) =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
                required
                placeholder={isArabic ? 'أدخل اسم المؤلف' : 'Enter author name'}
                className="mt-1"
              />
            </div>

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

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'SEO' : 'SEO Settings'}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? 'إعدادات تحسين محركات البحث (اختياري)' : 'Search engine optimization settings (optional)'}
            </p>
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
      </form>
    </div>
  );
}

