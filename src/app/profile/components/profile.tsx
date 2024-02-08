'use client';

import { Slogan } from '@/app/components/slogan';
import ProfileSelect from '@/app/components/profileSelect';
import { Typography } from 'antd';

const Profile = () => {
  return (
    <>
      <Slogan />
      <ProfileSelect showButtons={true} width='100%' />
    </>
  );
}

export { Profile };
