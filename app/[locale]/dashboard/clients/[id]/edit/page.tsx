import { EditClientForm } from '../../components/EditClientForm';

type ParamsPromise = Promise<{ id: string }>;

export default async function EditClientPage({ params }: { params: ParamsPromise }) {
  const { id } = await params;
  return <EditClientForm id={id} />;
}


