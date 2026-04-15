import type { Metadata } from 'next';
import { getProjectBySlug } from '../actions/actions';

export async function generateProjectsMetadata(
  locale: string
): Promise<Metadata> {
  return {
    title:
      locale === 'ar' ? 'المشاريع - SMART' : 'Projects - SMART',
    description:
      locale === 'ar'
        ? 'مشاريعنا الناجحة في إدارة الحشود وتنظيم الفعاليات'
        : 'Our successful crowd management and event organization projects',
  };
}

export async function generateProjectDetailMetadata(
  locale: string,
  id: string
): Promise<Metadata> {
  const project = await getProjectBySlug(id, locale);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const name = locale === 'ar' && project.nameAr ? project.nameAr : project.name;
  return {
    title: `${name} - SMART`,
    description:
      project.seoDescription ||
      (locale === 'ar' && project.descriptionAr
        ? project.descriptionAr
        : project.description || ''),
  };
}

