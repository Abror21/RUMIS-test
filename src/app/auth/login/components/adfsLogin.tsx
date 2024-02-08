'use client';

import { Spin } from 'antd';
import { signIn } from 'next-auth/react';
import useHandleError from '@/app/utils/useHandleError';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Slogan } from '@/app/components/slogan';

interface AdfsLoginProps {
  code?: string,
  returnUrl?: string
}

const AdfsLogin = ({ code, returnUrl }: AdfsLoginProps) => {
  const router = useRouter();
  const [handleError] = useHandleError();

  useEffect(() => {
    const adfsLogin = async () => {
      const result = await signIn('adfs', {
        redirect: false,
        code: code
      });

      if (result?.error) {
        if (handleError) {
          handleError({ error: 'Kaut kas nogāja greizi!' });
        }
      } else {
        router.replace(`/profile`);
      }
    }

    adfsLogin()
  }, []);

  return (
    <div>
      <Slogan />
      <div className='text-center py-3'>
        <Spin />
      </div>
    </div>
  );
}

export { AdfsLogin };
