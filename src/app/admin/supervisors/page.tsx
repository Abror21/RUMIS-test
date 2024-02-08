import { AdminMain } from '@/app/templates/AdminMain';
import Roles from '@/app/admin/roles/components/roles';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';
import SupervisorList from './components/SupervisorList';

const title = 'Vadošo iestāžu saraksts';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const SupervisorsPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.supervisorView} redirectTo='/'>
        <SupervisorList />
      </Permission>
    </AdminMain>
  );
};

export default SupervisorsPage;
