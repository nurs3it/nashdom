import { EditPropertyPage } from '@/pages/dashboard/edit-property-page';

export default async function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPropertyPage id={id} />;
}
