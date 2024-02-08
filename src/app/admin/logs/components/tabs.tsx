'use client';

import { Menu } from 'antd';
import Link from 'next/link';

const Tabs = ({ active }: { active: string }) => {
  return (
    <div className="mb-5">
      <Menu
        selectedKeys={[active]}
        mode="horizontal"
        items={[
          {
            label: <Link href="/admin/logs" className='border-none'>Tehniskais audits</Link>,
            key: 'logs',
          },
          {
            label: <Link href="/admin/logs/gdpr" className='border-none'>Personaudits</Link>,
            key: 'gdpr'
          }]}
      />
    </div>
  );
};

export { Tabs };
