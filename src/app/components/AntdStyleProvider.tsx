'use client';

import { PropsWithChildren } from 'react';
import { ConfigProvider } from 'antd';
import StyledComponentsRegistry from '@/lib/AntdRegistry';

export function AntdStyleProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#663399'
        }
      }}
    >
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
    </ConfigProvider>
  );
}
