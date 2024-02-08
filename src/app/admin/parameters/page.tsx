import { AdminMain } from '@/app/templates/AdminMain';
import Parameters from '@/app/admin/parameters/components/parameters';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';

const title = 'Parametri';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const RolesPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.roleView} redirectTo='/'>
        <Parameters />
      </Permission>
    </AdminMain>
  );
};

export default RolesPage;
