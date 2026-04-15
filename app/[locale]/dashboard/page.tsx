import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/lib/routing';
import { 
  FolderKanban, 
  FileText, 
  CheckCircle, 
  Clock 
} from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard/stats';
import { format } from 'date-fns';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = await getDashboardStats();
  const isArabic = locale === 'ar';

  const statCards = [
    {
      title: isArabic ? 'إجمالي المشاريع' : 'Total Projects',
      value: stats.projects.total.toString(),
      icon: FolderKanban,
      change: stats.projects.change,
    },
    {
      title: isArabic ? 'المشاريع المنشورة' : 'Published Projects',
      value: stats.projects.published.toString(),
      icon: CheckCircle,
      change: stats.projects.change,
    },
    {
      title: isArabic ? 'إجمالي المقالات' : 'Total Posts',
      value: stats.posts.total.toString(),
      icon: FileText,
      change: stats.posts.change,
    },
    {
      title: isArabic ? 'المقالات المنشورة' : 'Published Posts',
      value: stats.posts.published.toString(),
      icon: FileText,
      change: stats.posts.change,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar'
            ? 'نظرة عامة على أداء الشركة'
            : 'Overview of company performance'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'المشاريع الأخيرة' : 'Recent Projects'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'لا توجد مشاريع حديثة'
                  : 'No recent projects'}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentProjects.map((project: { id: string; name?: string | null; nameAr?: string | null; createdAt: string | Date; published?: boolean | null }) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/projects/${project.id}/edit`}
                        className="block font-medium truncate hover:text-primary"
                      >
                        {isArabic && project.nameAr
                          ? project.nameAr
                          : project.name || project.nameAr || 'Untitled'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        {!project.published && (
                          <span className="text-yellow-600">
                            ({isArabic ? 'مسودة' : 'Draft'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recentProjects.length >= 5 && (
                  <div className="pt-2 border-t">
                    <Link
                      href="/dashboard/projects"
                      className="text-sm text-primary hover:underline"
                    >
                      {isArabic ? 'عرض الكل' : 'View All'} →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? 'المقالات الأخيرة' : 'Recent Posts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'لا توجد مقالات حديثة'
                  : 'No recent posts'}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentPosts.map((post: { id: string; title?: string | null; titleAr?: string | null; createdAt: string | Date; published?: boolean | null }) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/blog/${post.id}/edit`}
                        className="block font-medium truncate hover:text-primary"
                      >
                        {isArabic && post.titleAr
                          ? post.titleAr
                          : post.title || post.titleAr || 'Untitled'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                        {!post.published && (
                          <span className="text-yellow-600">
                            ({isArabic ? 'مسودة' : 'Draft'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recentPosts.length >= 5 && (
                  <div className="pt-2 border-t">
                    <Link
                      href="/dashboard/blog"
                      className="text-sm text-primary hover:underline"
                    >
                      {isArabic ? 'عرض الكل' : 'View All'} →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



