import { EditBlogPostForm } from '../../components/EditBlogPostForm';

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  return <EditBlogPostForm postId={id} />;
}
