import { AdminMain } from '@/app/templates/AdminMain';
import { Logs } from '@/app/admin/logs/components/logs';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';


const title = 'Auditēšanas pieraksti';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const LogsPage = async () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.logView} redirectTo='/'>
        <Logs />
      </Permission>
    </AdminMain>
  );
};

export default LogsPage;
