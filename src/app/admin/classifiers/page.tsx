import { AdminMain } from '@/app/templates/AdminMain';
import { Classifiers } from '@/app/admin/classifiers/components/classifiers';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';
// import Permission from '@/app/components/Permission';

const title = 'Klasifikatori';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const ClassifiersPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.classifierView} redirectTo='/'>
        <Classifiers />
      </Permission>
    </AdminMain>
  );
};

export default ClassifiersPage;
