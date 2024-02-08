import { AdminMain } from '@/app/templates/AdminMain';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';
import { EditAddResourceForm } from './components/EditAddResourceForm';

const title = 'Jauns resurss';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const NewResourcePage = () => {
  return (
    <AdminMain
      pageTitle={title}
      background="#f5f5f5"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/resources">Resursi</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.resourceEdit} redirectTo='/'>
        <EditAddResourceForm isAddForm={true}/>
      </Permission>
    </AdminMain>
  );
};

export default NewResourcePage;

