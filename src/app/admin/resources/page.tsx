import { AdminMain } from '@/app/templates/AdminMain';
import { Resources } from '@/app/admin/resources/components/resources';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';

const title = 'Resursu saraksts';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const ResursiPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.resourceView} redirectTo='/'>
        <Resources />
      </Permission>
    </AdminMain>
  );
};

export default ResursiPage;


