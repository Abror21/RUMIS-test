'use client';

import { Layout, theme } from 'antd';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import Image from 'next/image'
import { AdminBreadcrumbs, IBreadcrumbs } from '@/app/components/breadcrumbs';
import CustomFooter from './CustomFooter';

const { Content, Footer } = Layout;

type IAdminContentProps = {
  title: string;
  background?: string;
  children: ReactNode;
  breadcrumb: IBreadcrumbs[]
};

const AdminContent = (props: IAdminContentProps) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      <AdminBreadcrumbs
        items={props.breadcrumb}
      />
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
            background: props.background ? props.background : colorBgContainer
        }}
      >
        <h1 className="mb-7 text-2xl font-semibold">{props.title}</h1>
        {props.children}
      </Content>
      <CustomFooter />
    </Layout>
  );
};

export default AdminContent;
