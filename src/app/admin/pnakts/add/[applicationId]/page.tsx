import { AdminMain } from '@/app/templates/AdminMain';
import { PnAkti } from '@/app/admin/pnakti/components/pnakti';
import { Metadata } from 'next'
import Link from 'next/link';
import AddPnAct from './components/AddPnAct';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';

const title = 'P/N akts';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const AddActPage = ({ params }: { params: { applicationId: string } }) => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/pnakti">P/N akti</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.applicationResourceEdit} redirectTo='/'>
        <AddPnAct applicationId={params.applicationId}/>
      </Permission>
    </AdminMain>
  );
};

export default AddActPage;


