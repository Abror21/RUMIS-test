import { AdminMain } from '@/app/templates/AdminMain';
import { Applications } from '@/app/admin/applications/components/applications';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';

const title = 'Pieteikumi';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const ApplicationPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission="application.view" redirectTo='/'>
        <Applications />
      </Permission>
    </AdminMain>
  );
};

export default ApplicationPage;


