import { EditProjectForm } from '../../components/EditProjectForm';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  return <EditProjectForm projectId={id} />;
}
