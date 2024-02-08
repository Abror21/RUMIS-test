import { AdminMain } from '@/app/templates/AdminMain';
import { Metadata } from 'next'
import Link from 'next/link';
import { UserAccount } from '@/app/admin/account/components/userAccount';

const title = 'Mans profils';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const Account = () => {
  return (
    <AdminMain
      pageTitle={title}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: title },
      ]}
    >
      <UserAccount/>
    </AdminMain>
  );
};

export default Account;


