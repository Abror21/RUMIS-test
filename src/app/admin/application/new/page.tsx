import { AdminMain } from '@/app/templates/AdminMain';
import { NewApplication } from '@/app/admin/application/new/components/newApplication';
import { Metadata } from 'next'
import Link from 'next/link';

const title = 'Jauns pieteikums';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const NewApplicationPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/applications">Pieteikumi</Link> },
        { title: title },
      ]}
    >
      <NewApplication />
    </AdminMain>
  );
};

export default NewApplicationPage;

