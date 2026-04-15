'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface FeaturedProjectsProps {
  projects: Array<{
    id: string;
    name: string;
    nameAr?: string | null;
    slug: string;
    description?: string | null;
    descriptionAr?: string | null;
    featuredImage?: string | null;
    locale: string;
  }>;
  locale: string;
}

export function FeaturedProjects({ projects, locale }: FeaturedProjectsProps) {
  const tCommon = useTranslations('common.cta');
  const isArabic = locale === 'ar';

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'المشاريع المميزة' : 'Featured Projects'}
          </h2>
          <p className="text-xl text-muted-foreground">
            {isArabic ? 'فعالياتنا الناجحة الأخيرة' : 'Our recent successful events'}
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {isArabic
              ? 'لا توجد مشاريع مميزة حالياً'
              : 'No featured projects available'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const name = isArabic && project.nameAr
                ? project.nameAr
                : project.name || project.nameAr || 'Untitled';
              const description = isArabic && project.descriptionAr
                ? project.descriptionAr
                : project.description || project.descriptionAr || '';
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all hover-lift border-2 hover:border-accent/30 group relative overflow-hidden">
                    {/* Yellow accent bar on hover */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Featured Image */}
                    {project.featuredImage && (
                      <div className="relative w-full h-48 bg-muted">
                        <Image
                          src={project.featuredImage}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="group-hover:text-accent transition-colors">
                        {name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {description && (
                        <CardDescription className="leading-relaxed mb-4 line-clamp-3">
                          {description}
                        </CardDescription>
                      )}
                      <Button
                        asChild
                        variant="ghost"
                        className="mt-4 hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Link href={`/projects/${project.slug}`} locale={project.locale || locale}>
                          {tCommon('learnMore')}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/projects">{tCommon('viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

