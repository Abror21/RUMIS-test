'use client';

import { Spin, Tabs, TabsProps, Typography, Divider } from "antd";
import { useState } from 'react';
import dayjs from 'dayjs';
import { dateFormat } from '@/app/utils/AppConfig';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { PersonProfileType } from '@/app/admin/users/components/personProfileView';
import { ViewValue } from '@/app/components/viewValue';
import { getPersonType, profileName } from '@/app/utils/utils';
import { useSession } from "next-auth/react";

const { Title } = Typography;
interface Profiles {
  key: string;
  label: string;
  children: React.ReactNode;
}

const UserAccount = () => {
  const [recievedData, setRecievedData] = useState<Profiles[]>([]);

  const { data: sessionData } = useSession();
  
  const {
    isLoading,
  } = useQueryApiClient({
    request: {
      url: '/account/profiles'
    },
    onSuccess: (response: PersonProfileType[]) => {
      const items = response.map((item: any, index: number) => ({
        key: index.toString(),
        label: profileName(item),
        children: (
          <div>
            <Title level={3}>Tiesības</Title>
            <div className='grid gap-4 grid-cols-3'>
              <ViewValue
                label="Tiesību līmenis"
                value={getPersonType(item)}
              />
            
              { item.type === 'Country' ?
                <ViewValue
                  label="Tiesību objekts"
                  value={'-'}
                />
                :
                <ViewValue
                  label="Tiesību objekts"
                  value={profileName(item)}
                />
              }
            </div>
            <div className='grid gap-4 grid-cols-3'>
              <ViewValue
                label="Loma"
                value={item.roles?.map((role: any) => (
                  <div key={role.id}>{role.name}</div>
                ))}
              />
              <ViewValue
                label="Spēkā līdz"
                value={item.expires ? dayjs(item.expires).format(dateFormat) : '-'}
              />
              <div>
                {item.disabled ?
                  <StopOutlined />
                :
                  <CheckOutlined />
                }
              </div>
            </div>
            <Divider />
            <Title level={3}>Lietotāja dati</Title>
            <div className='grid gap-4 grid-cols-2'>
              <ViewValue
                label="E-pasta adrese"
                value={item.email ?? '-'}
              />
              <ViewValue
                label="Tālrunis"
                value={item.phoneNumber ?? '-'}
              />
            </div>
            <div className='grid gap-4 grid-cols-2'>
              <ViewValue
                label="Institūcija"
                value={item.institutionId?.value ?? '-'}
              />
              <ViewValue
                label="Amats"
                value={item.job ?? '-'}
              />
            </div>
            <div className='grid gap-4 grid-cols-2'>
              <ViewValue
                label="Profila izveides pamatojuma dokumenta Nr."
                value={item.profileCreationDocumentNumber ?? '-'}
              />
              <ViewValue
                label="Datums"
                value={item.profileCreationDocumentDate ? dayjs(item.profileCreationDocumentDate).format(dateFormat) : '-'}
              />
            </div>
            <ViewValue
              label="Piezīmes"
              value={item.notes ?? '-'}
            />
          </div>
        )
      }));
      setRecievedData(items);
    },
  });

  const {
    data: userData,
  } = useQueryApiClient({
    request: {
      url: `/persons/getByUserId(${sessionData?.user?.id})`
    },
  });

  return (
    <>
      <div className="mb-5"><span className="text-lg">{userData?.firstName} {userData?.lastName} ({userData?.privatePersonalIdentifier})</span></div>
      <div>
        <Spin spinning={isLoading}>
          <Tabs defaultActiveKey="1" items={recievedData}/>
        </Spin>
      </div>
    </>
  );
}

export { UserAccount };