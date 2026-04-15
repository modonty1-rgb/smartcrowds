import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import { ArrowRight } from 'lucide-react';
import { getProjects } from '../actions/actions';
import Image from 'next/image';

interface ProjectsContentProps {
  locale: string;
}

export async function ProjectsContent({ locale }: ProjectsContentProps) {
  const result = await getProjects({
    locale,
    page: 1,
    limit: 50,
  });

  type PublicProject = {
    id: string;
    slug: string;
    name?: string | null;
    nameAr?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    featuredImage?: string | null;
    locale?: 'en' | 'ar' | string;
  };
  const projects: PublicProject[] = (result?.projects as unknown[]) as PublicProject[] || [];
  const isArabic = locale === 'ar';

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'المشاريع' : 'Our Projects'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isArabic
              ? 'مشاريعنا الناجحة في إدارة الحشود وتنظيم الفعاليات'
              : 'Our successful crowd management and event organization projects'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {isArabic ? 'لا توجد مشاريع متاحة حالياً' : 'No projects available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: PublicProject) => (
              <Card
                key={project.id}
                className="h-full hover:shadow-lg transition-shadow overflow-hidden"
              >
                {project.featuredImage && (
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={project.featuredImage}
                      alt={project.nameAr || project.name || 'Project image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>
                    {isArabic && project.nameAr
                      ? project.nameAr
                      : project.name || project.nameAr}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(project.descriptionAr || project.description) && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {isArabic && project.descriptionAr
                        ? project.descriptionAr
                        : project.description || project.descriptionAr}
                    </p>
                  )}
                  <Button asChild variant="ghost">
                    <Link href={`/projects/${project.slug}`} locale={project.locale || locale}>
                      {isArabic ? 'اعرف المزيد' : 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

