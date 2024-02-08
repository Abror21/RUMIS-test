import { AdminMain } from '@/app/templates/AdminMain';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';
import EducationalInstitutionList from './components/EducationalInstitutionList';

const title = 'Izglītības iestāžu saraksts';

// Static metadata
export const metadata: Metadata = {
  title: title,
}
// TODO: Temporary this component is not being used
const EducationalInstitutionsPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.educationalInstitutionView} redirectTo='/'>
        <EducationalInstitutionList />
      </Permission>
    </AdminMain>
  );
};

export default EducationalInstitutionsPage;
