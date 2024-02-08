import { AdminMain } from '@/app/templates/AdminMain';
import { GdprLogs } from '@/app/admin/logs/gdpr/components/gdprLogs';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';


const title = 'Personaudits';

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
        { title: <Link href="/admin/logs">Auditēšanas pieraksti</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.logView} redirectTo='/'>
        <GdprLogs />
      </Permission>
    </AdminMain>
  );
};

export default LogsPage;
