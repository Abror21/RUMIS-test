import { AdminMain } from '@/app/templates/AdminMain';
import { Users } from '@/app/admin/users/components/users';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';

const title = 'Lietotāji';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const UsersPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background='#f5f5f5'
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.userPersonView} redirectTo='/'>
        <Users />
      </Permission>
    </AdminMain>
  );
};

export default UsersPage;

