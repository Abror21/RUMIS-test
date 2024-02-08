import { Typography, Divider, Spin } from 'antd';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import { RoleType } from '@/app/admin/users/components/users';
import { ClassifierListTermType } from '@/app/admin/classifiers/components/classifiers';
import { ViewValue } from '@/app/components/viewValue';
import dayjs from 'dayjs';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { useEffect } from 'react';
import { dateFormat } from '@/app/utils/AppConfig';
import { getPersonType } from '@/app/utils/utils';

const { Title } = Typography;

export interface PersonProfileType {
  id: string;
  disabled: boolean;
  educationalInstitution?: ClassifierListTermType;
  educationalInstitutionId?: string;
  email: string;
  expires: string;
  supervisId?: string;
  supervisor?: ClassifierListTermType;
  phoneNumber: string;
  type: string;
  userId: string;
  roles: RoleType[];
  profileCreationDocumentNumber: string;
  profileCreationDocumentDate: string;
  notes: string;
  configurationInfo: string;
  institutionId: string;
  job: string;
}

interface PersonProfileViewProps {
  profileId: string,
}

const PersonProfileView = ({ profileId }: PersonProfileViewProps) => {
  const { appendData, isLoading, data: profile } = useQueryApiClient({
    request: {
      url: '/UserProfile/:id',
      disableOnMount: true
    }
  });

  useEffect(() => {
    appendData([], { id: profileId })
  }, [profileId]);
  
  return (
    <div>
      { isLoading ?
        <div className="example">
          <Spin />
        </div>
      :
        <>
          <Title level={3}>Profila tiesības</Title>
          <div className='grid gap-4 grid-cols-2'>
            <ViewValue
              label="Tiesību līmenis"
              value={getPersonType(profile)}
            />
            { profile.type === 'Founder' &&
              <ViewValue
                label="Tiesību objekts"
                value={profile.founderId}
              />
            }
            { profile.type === 'Supervisor' &&
              <ViewValue
                label="Tiesību objekts"
                value={profile?.supervisor?.name}
              />
            }
            { profile.type === 'EducationalInstitution' &&
              <ViewValue
                label="Tiesību objekts"
                value={profile.educationalInstitution?.name}
              />
            }
            { profile.type === 'Country' &&
                <ViewValue
                  label="Tiesību objekts"
                  value={'-'}
                />
            }
          </div>
          <div className='grid gap-4 grid-cols-3'>
            <ViewValue
              label="Loma"
              value={profile.roles?.map((role: any) => (
                <div key={role.id}>{role.name}</div>
              ))}
            />
            <ViewValue
              label="Spēkā līdz"
              value={profile.expires ? dayjs(profile.expires).format(dateFormat) : '-'}
            />
            <div>
              {profile.disabled ?
                <StopOutlined />
              :
                <CheckOutlined />
              }
            </div>
          </div>
          <Divider />
          <Title level={3}>Profila dati</Title>
          <div className='grid gap-4 grid-cols-2'>
            <ViewValue
              label="E-pasta adrese"
              value={profile.email ?? '-'}
            />
            <ViewValue
              label="Tālrunis"
              value={profile.phoneNumber ?? '-'}
            />
          </div>
          <div className='grid gap-4 grid-cols-2'>
            <ViewValue
              label="Institūcija"
              value={profile.institutionId?.value ?? '-'}
            />
            <ViewValue
              label="Amats"
              value={profile.job ?? '-'}
            />
          </div>
          <div className='grid gap-4 grid-cols-2'>
            <ViewValue
              label="Profila izveides pamatojuma dokumenta Nr."
              value={profile.profileCreationDocumentNumber ?? '-'}
            />
            <ViewValue
              label="Datums"
              value={profile.profileCreationDocumentDate ? dayjs(profile.profileCreationDocumentDate).format(dateFormat) : '-'}
            />
          </div>
          <ViewValue
            label="Piezīmes"
            value={profile.notes ?? '-'}
          />
        </>
      }
    </div>
  );
}

export { PersonProfileView };
