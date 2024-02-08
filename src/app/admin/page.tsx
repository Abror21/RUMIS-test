import { AdminMain } from '@/app/templates/AdminMain';
import { Metadata } from 'next'
import Dashboard from './components/Dashboard';

const title = 'Vadības panelis';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const Admin = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: 'Sākums' }
      ]}
    >
      <Dashboard />
    </AdminMain>
  );
};

export default Admin;
