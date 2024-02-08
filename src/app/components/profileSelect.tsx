import {
  Form,
  Select,
  Button,
  Spin,
  Typography
} from 'antd';
import { signOut, useSession } from 'next-auth/react';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import useHandleError from '@/app/utils/useHandleError';
import { PersonProfileType } from '@/app/admin/users/components/personProfileView';
import { profileName, signOutHandler } from '@/app/utils/utils';
import { SelectOption } from '../types/Antd';
import axios from 'axios';
import { useTimer } from './TimerContext';

interface ProfileSelectProps {
  showButtons?: boolean,
  width?: string
}

const {Title} = Typography

const ProfileSelect = ({ showButtons = false, width = '200px' }: ProfileSelectProps) => {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [profileOptionsReceived, setProfileOptionsReceived] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { update, data: sessionData } = useSession()
  const router = useRouter();
  const [form] = Form.useForm();
  const [handleError] = useHandleError();

  const { resetTimer } = useTimer();

  const selectedProfileId = Form.useWatch('profile', form)

  const setProfile = async (profileId: string, options: SelectOption[]) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/account/setprofile(${profileId})`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${sessionData?.user?.accessToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      const token = response.data;

      if (token && token.status_code > 299) {
        throw Error
      }

      updateSession( token.token, token.tokenExpires, profileId, token.permissions, options)
    } catch (error) {
      handleError({ error: 'Kaut kas nogāja greizi!' });
      setIsLoading(false)
    }
  }

  const pathname = usePathname();

  useQueryApiClient({
    request: {
      url: '/account/profiles'
    },
    onSuccess: (response: PersonProfileType[]) => {
      if (profileOptionsReceived) return
      setProfileOptionsReceived(true)
      
      const options = response.map((profile: PersonProfileType) => {
        return {
          label: profileName(profile),
          value: profile.id,
          rest: {
            educationalInstitutionId: profile?.educationalInstitution?.id,
            permissionType: profile?.type,
            supervisor: profile?.supervisor?.id,
          }
        };
      })
      setOptions(options);
      if (showButtons && options.length === 1) {
        // Select by default if one profile is presented
        setProfile(options[0].value, options)
      } else {
        setIsLoading(false)
      }
    },
  });

  const updateSession = async (token: string, tokenExpires: string, profileId: string, permissions: string[], options: SelectOption[]) => {
    const profile = options.find(o => o.value === profileId)
    await update({
      profileToken: token,
      profileTokenExpires: tokenExpires,
      profileId: profileId,
      permissions: permissions,
      educationalInstitutionId: profile?.rest.educationalInstitutionId,
      supervisor: profile?.rest.supervisor,
      permissionType: profile?.rest.permissionType
    })
    
    pathname === '/admin' ? window.location.href = pathname : await router.replace(`/admin`);
  }
  const { appendData } = useQueryApiClient({
    request: {
      url: `/account/setprofile(${selectedProfileId})`,
      method: 'POST',
    },
    onSuccess: (response) => {
      const {token, tokenExpires, permissions} = response
      updateSession(token, tokenExpires, selectedProfileId ,permissions, options)
    },
  });

  const handleChange = (newValue: string) => {
    if (!showButtons) {
      setProfile(newValue, options)
    }
  }

  const initialValues = {
    profile: sessionData?.user?.profileId
  };

  const handleFinish = () => {
    setIsLoading(true)
    appendData()
  }

  const signOutClickHandle = async () => {
    resetTimer()
    const redirectTo = await signOutHandler({accessToken: sessionData?.user?.accessToken, cookies: sessionData?.user?.cookies})
    signOut({callbackUrl: redirectTo})
  }

  return (
    <>
      {(showButtons && options.length !== 0) &&
        <Title level={3} className='text-center mb-4'>Izvēlies profilu</Title>
      }
      <Form
        form={form}
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Spin spinning={isLoading}>
          <>
            {(isLoading || options.length > 1) &&
              <Form.Item
                name="profile"
                style={{ marginBottom: "0px" }}
                rules={[{ required: true, message: 'Lūdzu izvēlies profilu.' }]}
                hidden={!isLoading && options.length === 1 && !showButtons}
              >
                  <Select
                    style={{ width: width }}
                    showSearch={false}
                    onChange={handleChange}
                    options={options}
                  >
                  </Select>
              </Form.Item>
            }
            {(options.length === 0 && !isLoading) &&
              <Title level={4}><b>Jums nav aktīva RUMIS profila.</b></Title>
            }
            { showButtons &&
              <div className='pt-8'>
                <Form.Item>
                  <div className="flex">
                    <Button htmlType="button" onClick={() => {
                      signOutClickHandle()
                    }}>
                      Atcelt
                    </Button>
                    {(options.length > 0) &&
                      <Button type="primary" className="!ml-auto" htmlType="submit">
                        Turpināt
                      </Button>
                    }
                  </div>
                </Form.Item>
              </div>
            }
          </>
        </Spin>
      </Form>
    </>
  );
};

export default ProfileSelect;
