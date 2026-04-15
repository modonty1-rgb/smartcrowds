import { ProjectGalleryContent } from '../../components/ProjectGalleryContent';

interface ProjectGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectGalleryPage({ params }: ProjectGalleryPageProps) {
  const { id } = await params;
  return <ProjectGalleryContent projectId={id} />;
}
