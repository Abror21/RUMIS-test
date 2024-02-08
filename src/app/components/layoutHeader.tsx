'use client';

import type { MenuProps } from 'antd';
import { Avatar, Col, Dropdown, Layout, Row, Menu, Button } from 'antd';
import Link from 'next/link';
import { ConfigProvider } from 'antd';
import {
  ApartmentOutlined,
  DatabaseOutlined,
  FileOutlined,
  SafetyOutlined,
  UserOutlined,
  FolderOutlined,
  FileDoneOutlined,
  LaptopOutlined,
  ReconciliationOutlined,
  DownOutlined,
  HomeOutlined,
  StarOutlined,
  AppstoreOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import ProfileSelect from '@/app/components/profileSelect';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { permissions } from '../utils/AppConfig';
import { useTimer } from './TimerContext';
import { signOutHandler } from '../utils/utils';

const { Header } = Layout;

interface IInitialItem {
  label?: React.ReactNode | string;
  key: string;
  type?: string;
  icon?: React.ReactNode;
  hasPermission: boolean;
}

const LayoutHeader = () => {
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);
  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []

  const { resetTimer } = useTimer();

  useEffect(() => {
    if (pathname) {
      if (current !== pathname) {
        setCurrent(pathname);
      }
    }
  }, [pathname, current]);

  const signOutClickHandle = async () => {
    resetTimer()
    const redirectTo = await signOutHandler({accessToken: sessionData?.user?.accessToken, cookies: sessionData?.user?.cookies})
    signOut({callbackUrl: redirectTo})
  }

  const initialItems: IInitialItem[] = [
    {
      label: <Link href="/admin/account">Profils</Link>,
      key: '0',
      hasPermission: true
    },
    {
      type: 'divider',
      hasPermission: true,
      key: 'divider'
    },
    {
      icon: <UserOutlined />,
      key: '/admin/users',
      label: <Link href="/admin/users">Lietotāji</Link>,
      hasPermission: userPermissions.includes(permissions.userPersonView)
    },
    {
      icon: <FileOutlined />,
      key: '/admin/document-templates',
      label: <Link href="/admin/document-templates">Dokumentu šabloni</Link>,
      hasPermission: userPermissions.includes(permissions.documentTemplateView)
    },
    {
      icon: <ApartmentOutlined />,
      key: '/admin/classifiers',
      label: <Link href="/admin/classifiers">Klasifikatori</Link>,
      hasPermission: userPermissions.includes(permissions.classifierView)
    },
    {
      icon: <DatabaseOutlined />,
      key: '/admin/logs',
      label: <Link href="/admin/logs">Auditēšanas pieraksti</Link>,
      hasPermission: userPermissions.includes(permissions.logView),
    },
    {
      icon: <SafetyOutlined />,
      key: '/admin/roles',
      label: <Link href="/admin/roles">Lietotāju lomas</Link>,
      hasPermission: userPermissions.includes(permissions.roleView)
    },
    {
      icon: <HomeOutlined />,
      key: '/admin/educational-institutions',
      label: <Link href="/admin/educational-institutions">Izglītības iestādes</Link>,
      hasPermission: userPermissions.includes(permissions.educationalInstitutionView)
    },
    {
      icon: <StarOutlined />,
      key: '/admin/supervisors',
      label: <Link href="/admin/supervisors">Vadošas iestādes</Link>,
      hasPermission: userPermissions.includes(permissions.supervisorView)
    },
    {
      icon: <AppstoreOutlined />,
      key: '/admin/parameters',
      label: <Link href="/admin/parameters">Parametri</Link>,
      hasPermission: userPermissions.includes(permissions.parameterView)
    },
    {
      icon: <NotificationOutlined />,
      key: '/admin/text-templates',
      label: <Link href="/admin/text-templates">Paziņojumu teksti</Link>,
      hasPermission: userPermissions.includes(permissions.textTemplateView)
    },
    {
      type: 'divider',
      hasPermission: true,
      key: 'divider-1'
    },
    {
      label: <Button className='w-full !text-left' size='small' type='link' onClick={() => {
        signOutClickHandle()
      }}>Iziet</Button>,
      key: '1',
      hasPermission: true
    },
  ];

  const items: MenuProps['items'] = initialItems
    .filter(item => item.hasPermission)
    .map(item => {
      const { hasPermission, ...rest } = item
      return rest
    });

  const headerNav = [
    {
      icon: <FolderOutlined />,
      key: '/admin/applications',
      label: <Link href="/admin/applications">Pieteikumi</Link>,
      hasPermission: userPermissions.includes(permissions.applicationView)
    },
    {
      icon: <FileDoneOutlined />,
      key: '/admin/pnakti',
      label: <Link href="/admin/pnakti">P/N akti</Link>,
      hasPermission: userPermissions.includes(permissions.applicationResourceView)
    },
    {
      icon: <LaptopOutlined />,
      key: '/admin/resources',
      label: <Link href="/admin/resources">Resursi</Link>,
      hasPermission: userPermissions.includes(permissions.resourceView)
    },
    {
      icon: <ReconciliationOutlined />,
      key: '/admin/parskati',
      label: <Link href="/admin/parskati">Pārskati</Link>,
      hasPermission: userPermissions.includes(permissions.reportView)
    }
  ];

  return (
    <Header style={{ width: '100%', backgroundColor: '#663399' }}>
      <Row wrap={false} gutter={[42, 0]}>
        <Col>
          <Link href="/admin" className="text-white text-xl">RUMIS</Link>
        </Col>
        <Col flex="auto">
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#68478d'
              }
            }}
          >
            <Menu
              theme="dark"
              style={{ backgroundColor: '#663399' }}
              mode="horizontal"
              selectedKeys={[current]}
              items={headerNav.filter(item => item.hasPermission).map(({ hasPermission, ...rest }) => rest)}
            />
          </ConfigProvider>
        </Col>
        <Col className='flex items-center gap-x-8'>
          <ProfileSelect showButtons={false}/>
          <Dropdown menu={{ items: items }} trigger={['click']}>
            <button type="button" className="!bg-transparent">
              <span className='flex items-center gap-x-3'>
                <span className="text-white">
                  {sessionData?.user?.userName}
                </span>
                <Avatar
                  style={{ backgroundColor: '#fff', color: '#663399' }}
                  size="large"
                  icon={<UserOutlined />}
                />
                <DownOutlined style={{ color: '#fff' }} />
              </span>
            </button>
          </Dropdown>
        </Col>
      </Row>
    </Header>
  );
};

export default LayoutHeader;
