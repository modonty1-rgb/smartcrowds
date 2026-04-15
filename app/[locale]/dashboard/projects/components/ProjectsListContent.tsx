import { Link } from '@/lib/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Eye, Image as ImageIcon, Images } from 'lucide-react';
import Image from 'next/image';
import { getProjects } from '../actions/actions';
import { DeleteProjectButton } from './DeleteProjectButton';

interface ProjectsListContentProps {
  locale: string;
  currentPage: number;
}

export async function ProjectsListContent({ locale, currentPage }: ProjectsListContentProps) {
  const result = await getProjects({
    locale: locale.toLowerCase().trim(), // Filter projects by current route locale (normalized)
    published: undefined,
    page: currentPage,
    limit: 20,
  });

  type DashboardProject = {
    id: string;
    name?: string | null;
    nameAr?: string | null;
    slug?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    featuredImage?: string | null;
    locale?: 'en' | 'ar' | string;
    published?: boolean | null;
    featured?: boolean | null;
    images?: Array<unknown> | null;
  };
  const pagination = (result && result.pagination) || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const projects: DashboardProject[] = (result?.projects as unknown[]) as DashboardProject[] || [];
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'إدارة المشاريع' : 'Projects Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة وتحرير المشاريع'
              : 'Manage and edit projects'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة مشروع' : 'Add Project'}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isArabic ? 'المشاريع' : 'Projects'}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {pagination.total} {isArabic ? 'مشروع' : 'projects'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {isArabic
                ? 'لا توجد مشاريع بعد'
                : 'No projects yet. Create your first project!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: DashboardProject) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Featured Image */}
                  {project.featuredImage ? (
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={project.featuredImage}
                        alt={project.nameAr || project.name || 'Project image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                          {!project.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/90 text-yellow-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مسودة' : 'Draft'}
                            </span>
                          )}
                          {project.featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500/90 text-blue-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مميز' : 'Featured'}
                            </span>
                          )}
                        </div>
                        {/* Locale Badge */}
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded backdrop-blur-sm border ${project.locale === 'ar'
                              ? 'bg-blue-600/90 text-white border-blue-700'
                              : 'bg-purple-600/90 text-white border-purple-700'
                            }`}
                        >
                          {project.locale === 'ar' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                          {!project.published && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/90 text-yellow-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مسودة' : 'Draft'}
                            </span>
                          )}
                          {project.featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500/90 text-blue-950 rounded backdrop-blur-sm">
                              {isArabic ? 'مميز' : 'Featured'}
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded backdrop-blur-sm border ${project.locale === 'ar'
                              ? 'bg-blue-600/90 text-white border-blue-700'
                              : 'bg-purple-600/90 text-white border-purple-700'
                            }`}
                        >
                          {project.locale === 'ar' ? 'العربية' : 'English'}
                        </span>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {project.locale === 'ar' && project.nameAr
                        ? project.nameAr
                        : project.name || project.nameAr || 'Untitled'}
                    </h3>

                    {/* Description */}
                    {(project.descriptionAr || project.description) && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.locale === 'ar' && project.descriptionAr
                          ? project.descriptionAr
                          : project.description || project.descriptionAr}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      {project.images && project.images.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{project.images.length} {isArabic ? 'صورة' : 'images'}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/projects/${project.id}/gallery`}>
                          <Images className="h-4 w-4 mr-1" />
                          {isArabic ? 'المعرض' : 'Gallery'}
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteProjectButton
                        projectId={project.id}
                        projectName={
                          project.locale === 'ar' ? project.nameAr ?? project.name : project.name ?? project.nameAr
                        }
                        locale={locale}
                      />
                      {project.slug && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects/${project.slug}`} locale={project.locale || 'en'}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
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
                    <Link href={`/dashboard/projects?page=${pageNum}`}>
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

