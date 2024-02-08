import Permission from '@/app/components/Permission';
import { AdminMain } from '@/app/templates/AdminMain';
import { permissions } from '@/app/utils/AppConfig';
import { Metadata } from 'next'
import TextTemplates from './components/TextTemplates'

const title = 'Paziņojumu teksti';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const TextTemplatesPage = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: 'Sākums' }
      ]}
    >
      <Permission permission={permissions.textTemplateView} redirectTo='/'>
        <TextTemplates />
      </Permission>
    </AdminMain>
  );
};

export default TextTemplatesPage;
