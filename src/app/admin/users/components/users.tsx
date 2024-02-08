'use client';

import {
  Dropdown,
  Modal,
  Table,
  Button
} from 'antd';
import { AppConfig, permissions } from '@/app/utils/AppConfig';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

import { profileName, personStatus, handleScroll, getPersonType } from '@/app/utils/utils';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import { ClassifierListTermType } from '@/app/admin/classifiers/components/classifiers';
import { UserModal } from '@/app/admin/users/components/userModal';
import { UserFilters } from '@/app/admin/users/components/userFilters';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { confirm } = Modal;

export interface RoleType {
  id: string;
  name: string;
}
interface PersonType {
  firstName: string;
  lastName: string;
  privatePersonalIdentifier: string;
}

export interface ListPersonProfileType {
  id: string;
  type: string;
  educationalInstitution?: ClassifierListTermType;
  supervisor?: ClassifierListTermType;
  isDisabled: boolean;
  roles: RoleType[];
  isLoggedIn: boolean;
}

export interface UserType {
  id: string;
  userProfiles: ListPersonProfileType[],
  persons: PersonType[];
  show?: boolean;
  personTechnicalId: string;
  userId?: string
}

export interface UserFilterType {
  page: number;
  take: number,
  sort?: string;
  sortDir?: number;
  educationalInstitutionIds?: number[];
  supervisorIds?: number[];
  person?: string;
  roleIds?: number[];
  types?: string[];
}

export const initialValues = {
  page: 1,
  take: AppConfig.takeLimit,
  sort: 'firstName',
  sortDir: 0
};

const Users = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const pageTopRef = useRef(null);

  const [filter, setFilter] = useState<UserFilterType>(initialValues);

  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []

  const editPermission: boolean = userPermissions.includes(permissions.userPersonEdit)

  const {
    data: users,
    appendData,
    refetch,
    isLoading,
  } = useQueryApiClient({
    request: {
      url: '/users/persons',
      data: filter
    },
  });

  const { appendData: deleteAppendData } = useQueryApiClient({
    request: {
      url: `/users/:userId`,
      method: 'DELETE',
    },
    onSuccess: () => {
      setActiveUser(null)
      setModalOpen(false)
      refetch()
    },
  });

  const showConfirm = (userId: string) => {
    confirm({
      title: 'Vai tiešām vēlaties dzēst šos vienumus?',
      okText: 'Dzēst',
      okType: 'danger',
      cancelText: 'Atcelt',
      async onOk() {
        deleteAppendData([], { userId });
      },
      onCancel() { },
    });
  };

  const fetchRecords = (page: number, pageSize: number) => {
    const newPage = page !== filter.page ? page : 1;
    const newFilter: UserFilterType = { ...filter, page: newPage, take: pageSize };
    setFilter(newFilter);
    appendData(newFilter);
  };

  // TODO: delete button only visible if person have no profiles
  const items = (record: UserType) => {
    return {
      items: [
        {
          key: '1',
          label: (
            <button type="button" onClick={() => showConfirm(record.id)}>
              Dzēst
            </button>
          ),
        },
      ],
    };
  };

  const handleEdit = (data: UserType) => {
    setActiveUser(data)
    setModalOpen(true);
  };

  const columns: ColumnsType<UserType> = [
    {
      title: 'Lietotājs',
      dataIndex: 'persons',
      key: 'persons',
      render: (value: PersonType[]) => (
        <>{value[0].firstName} {value[0].lastName}</>
      ),
      defaultSortOrder: 'ascend',
      sorter: true,
    },
    {
      title: 'Tiesību līmenis',
      dataIndex: 'userProfiles',
      render: (userProfiles: any) => (
        userProfiles.map((profile: ListPersonProfileType) => (
          <div key={profile.id}>{getPersonType(profile)}</div>
        ))
      ),
      key: 'userProfiles',
    },
    {
      title: 'Tiesību objekts',
      dataIndex: 'userProfiles',
      render: (userProfiles: any) => (
        userProfiles.map((profile: ListPersonProfileType) => {
          if (profile.type !== 'Country') {
            return <div key={profile.id}>{profileName(profile)}</div>
          }
        })
      ),
      key: 'userProfiles',
    },
    {
      title: 'Loma',
      dataIndex: 'userProfiles',
      render: (userProfiles: any) => (
        userProfiles.map((profile: ListPersonProfileType) => (
          <div key={profile.id}>
            {profile.roles.join(', ')}
          </div>
        ))
      ),
      key: 'userProfiles',
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      width: '150px',
      render: (_: any, record: UserType) => {
        const status: boolean = personStatus(record)
        if (status) {
          return (
            <Button
              onClick={() => handleEdit(record)}
            >
              Skatīt
            </Button>
          );
        }

        return (
          <Dropdown.Button
            onClick={() => handleEdit(record)}
            menu={items(record)}
          >
            Skatīt
          </Dropdown.Button>
        );
      }
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    sorter: SorterResult<UserType>,
  ) => {
    const newFilter: UserFilterType = {
      ...filter,
      page: (pagination?.current) ? pagination.current : 1,
      take: (pagination?.pageSize) ? pagination.pageSize : AppConfig.takeLimit,
      sort: 'firstName',
      sortDir: (sorter.order === 'ascend') ? 0 : 1
    };
    setFilter(newFilter);
    appendData(newFilter);
  };

  return (
    <>
      <div ref={pageTopRef}>
        <div className='bg-white p-6 rounded-lg mb-[10px]'>
          {editPermission &&
            <div className='flex justify-end'>
              <ButtonWithIcon
                event={() => setModalOpen(true)}
                label="Izveidot"
              />
            </div>
          }
          <UserFilters
            activeFilters={filter}
            filterState={setFilter}
            refresh={appendData}
          />
        </div>
        <div className='overflow-auto p-6 bg-white rounded-lg'>
          <Table
            scroll={{x: 'max-content'}}
            style={{wordBreak: 'break-word'}}
            loading={isLoading}
            dataSource={users?.items}
            columns={columns}
            onChange={(pagination, _, sorter) => handleTableChange(pagination, sorter as SorterResult<UserType>)}
            pagination={{
              current: filter.page,
              total: users?.total,
              onChange: (page, takeLimit) => {
                fetchRecords(page, takeLimit);
                handleScroll(pageTopRef.current);
              },
            }}
            rowKey={(record) => record.id}
          />
        </div>
      </div>
      <UserModal
        modalStatus={modalOpen}
        modalState={setModalOpen}
        refresh={() => refetch()}
        activePerson={activeUser}
        activePersonState={setActiveUser}
        activePersonDeleteState={showConfirm}
      />
    </>
  );
};

export { Users };
