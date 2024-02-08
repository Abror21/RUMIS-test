
import type { ReactNode } from 'react';
import LayoutHeader from '@/app/components/layoutHeader';
import AdminContent from '@/app/components/adminContent';
import { IBreadcrumbs } from '@/app/components/breadcrumbs';

type IAdminProps = {
  pageTitle: string;
  background?: string;
  children: ReactNode;
  breadcrumb: IBreadcrumbs[]
};

const AdminMain = (props: IAdminProps) => {
  return (
    <div className='min-h-screen flex flex-col'>
      <LayoutHeader />
      <div className='flex flex-auto flex-col'>
        <AdminContent
          title={props.pageTitle}
          background={props.background}
          breadcrumb={props.breadcrumb}
        >
          {props.children}
        </AdminContent>
      </div>
    </div>
  );
};

export { AdminMain };
