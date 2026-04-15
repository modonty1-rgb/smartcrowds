import { ProjectsListContent } from './components/ProjectsListContent';

interface ProjectsManagementPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ProjectsManagementPage({
  params,
  searchParams,
}: ProjectsManagementPageProps) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  return <ProjectsListContent locale={locale} currentPage={currentPage} />;
}



