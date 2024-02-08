import { Breadcrumb } from 'antd';
import type { ReactNode } from 'react';

export type IBreadcrumbs = {
  title: ReactNode;
};

type IBreadcrumbList = {
  items: IBreadcrumbs[];
};

const AdminBreadcrumbs = ({ items }: IBreadcrumbList) => {

  return (
    <Breadcrumb
      style={{ margin: '16px 24px' }}
      items={items}
    />
  );
};

export { AdminBreadcrumbs };
