import { AdminMain } from '@/app/templates/AdminMain';
import Reports from '@/app/admin/parskati/components/Reports';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';

const title = 'Pārskati';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const ParskatiPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.reportView} redirectTo='/'>
        <Reports />
      </Permission>
    </AdminMain>
  );
};

export default ParskatiPage;


