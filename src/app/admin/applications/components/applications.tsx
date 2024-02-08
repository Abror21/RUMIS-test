'use client';

import { useRef, useState} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
    Badge,
    Button,
    Dropdown,
    Table,
} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import dayjs from 'dayjs';

import useQueryApiClient from '@/app/utils/useQueryApiClient';
import {createApplicationListExcelFile, deleteFilterValuesFromLocalStorage, goToUrl, handleScroll, isJson} from '@/app/utils/utils';
import {dateApplicationFormat} from '@/app/utils/AppConfig';
import {ButtonWithIcon} from '@/app/components/buttonWithIcon';
import {useSession} from 'next-auth/react';
import {SorterResult} from 'antd/es/table/interface';
import ApplicationFilters from './ApplicationFilters';
import {Application as DataType} from '@/app/types/Applications';
import RejectApplicationModal from './RejectApplicationModal';
import {
    APPLICANT_STATUS_CONFIRMED,
    APPLICANT_STATUS_DELETED,
    APPLICANT_STATUS_SUBMITTED,
    APPLICANT_STATUS_POSTPONED
} from '../../application/new/components/applicantConstants';
import ChangeSequenceModal from './ChangeSequenceModal';
import {UserProfile} from '@/app/types/UserProfile';
import {SortableTableItem} from '@/app/components/SortableTable';
import * as NProgress from "nprogress";
import {CheckOutlined, ControlOutlined, DownOutlined, StopOutlined} from '@ant-design/icons';
import useHandleError, {DEFAULT_ERROR_MESSAGE} from '@/app/utils/useHandleError';
import DeleteApplicationModal from './DeleteApplicationModal';
import Link from 'next/link';
import ChangeFiltersModal from './ChangeFiltersModal';
import ExportModal from './ExportModal';
import locale from 'antd/es/date-picker/locale/lv_LV';

export type ApplicationsFilterType = {
    sort?: string;
    sortDir?: number;
    submitterPerson?: string;
    resourceTargetPersonTypeIds?: string;
    resourceTargetPerson?: string;
    resourceSubTypeIds?: string;
    applicationStatusIds?: string;
    submitterTypeIds?: string;
    applicationDateFrom?: string;
    applicationDateTo?: string;
    applicationNumber?: string;
    contactPhone?: string;
    contactEmail?: string;
    resourceTargetPersonEducationalProgram?: string;
    educationalInstitutionIds?: string;
    applicationSocialStatusIds?: string[]
    applicationSocialStatusApprovedIds?: string[]
    resourceTargetPersonEducationalStatusIds?: string | string[]
    resourceTargetPersonWorkStatusIds?: string | string[],
    supervisorIds?: string | string[],
    hasDuplicate?: boolean,
    resourceTargetPersonClass?: string,
    page: number;
    take: number;
}

export const initialValues = {
  page: 1,
  take: 25,
  sort: 'applicationDate',
  sortDir: 0
};

const Applications = () => {
  const searchParams = useSearchParams()

  const defaultSupervisorIds = searchParams.get('supervisorIds')
  const defaultApplicationStatusIds = searchParams.get('applicationStatusIds')
  const dataFromLocalStorage: any = {}
  for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('applications-')) {
          const value = localStorage.getItem(key)
          const parsedKey = key.replace('applications-', '') 
          if (isJson(value as string)) {
              dataFromLocalStorage[parsedKey] = JSON.parse(value as string)
          } else {
              dataFromLocalStorage[parsedKey] = value
          }
      }
  }
  
  const [filter, setFilter] = useState<ApplicationsFilterType>(
    {
      ...initialValues,
      ...dataFromLocalStorage,
      supervisorIds: defaultSupervisorIds ? [defaultSupervisorIds] : undefined,
      applicationStatusIds: defaultApplicationStatusIds ? defaultApplicationStatusIds : undefined,
    }
  );
  const [changeSequenceModalIsOpen, setChangeSequenceModalIsOpen] = useState<boolean>(false);
  const [changeFiltersModalIsOpen, setChangeFiltersModalIsOpen] = useState<boolean>(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false);
  const [selectedIdsForDelete, setSelectedIdsForDelete] = useState<string[] | null>(null);
  const [rejectedModalIsOpen, setRejectedModalIsOpen] = useState<boolean>(false);
  const [selectedIdsForReject, setSelectedIdsForReject] = useState<string[] | null>(null);

  const [handleError] = useHandleError()

  const actionsDropdown = (
    <Dropdown menu={{ items: [
      {
        key: '1',
        label: (
          <div onClick={() => openRejectModal()}>Atteikt atzīmētajiem</div>
        ),
      },
      {
        key: '2',
        label: (
          <div onClick={() => openDeleteModal()}>Dzēst atzīmētos</div>
        ),
      },
      {
        key: '3',
        label: (
          <div onClick={() => setExportModalIsOpen(true)}>Eksportēt sarakstu</div>
        ),
      },
      ]}
      }
    >
      <span className='cursor-pointer'>Darbības <DownOutlined  /></span>
    </Dropdown>
  )

  const defaultColumns: ColumnsType<DataType> = [
      {
          title: 'Pieteikuma numurs',
          dataIndex: 'applicationNumber',
          key: 'applicationNumber',
          sorter: true,
          className: '!font-semibold',
          render: (value: string, record: DataType) => <Link href={`/admin/application/${record.id}`}>{value}</Link>,
      },
      {
          title: 'Datums, laiks',
          dataIndex: 'applicationDate',
          key: 'applicationDate',
          render: (value: any) => value && dayjs(value).format(dateApplicationFormat),
          sorter: true,
          defaultSortOrder: 'ascend',
          width: 150
      },
      {
          title: 'Izglītības iestāde',
          dataIndex: 'educationalInstitution',
          key: 'educationalInstitution',
          width: 200,
          render: (value: any) => value.name,
          sorter: true
      },
      {
          title: 'Pieteikuma iesniedzējs',
          dataIndex: 'submitterPerson',
          key: 'submitterPerson',
          width: 150,
          render: (_: any, record: DataType) => {
              const {firstName, lastName} = record.submitterPerson.person[0]
              return `${firstName} ${lastName ?? ''}`
          },
          sorter: true
      },
      {
          title: 'Pieteikuma iesniedzēja p.k.',
          dataIndex: 'submitterPersonPk',
          key: 'submitterPersonPk',
          width: 150,
          render: (_: any, record: DataType) => {
              const {privatePersonalIdentifier} = record.submitterPerson.person[0]
              return privatePersonalIdentifier
          },
          sorter: true
      },
      {
          title: 'Iesniedzēja loma',
          dataIndex: 'submitterType',
          key: 'submitterType',
          render: (_: any, record: DataType) => (
              <>{record.submitterType.value}</>
          ),
          sorter: true
      },
      {
          title: 'Resursa lietotājs',
          dataIndex: 'resourceTargetPerson',
          key: 'resourceTargetPerson',
          width: 150,
          render: (_: any, record: DataType) => {
              const {firstName, lastName, privatePersonalIdentifier} = record.resourceTargetPerson.person[0]
              return `${firstName} ${lastName} (${privatePersonalIdentifier})`
          },
          sorter: true
      },
      {
          title: 'Resursa lietotāja tips',
          dataIndex: 'resourceTargetPersonType',
          key: 'resourceTargetPersonType',
          render: (_: any, record: DataType) => (
              <>{record.resourceTargetPersonType.value}</>
          ),
          sorter: true
      },
      {
          title: 'Resursa veids',
          dataIndex: 'resourceType',
          key: 'resourceType',
          width: 150,
          render: (_: any, record: DataType) => (
              <>{record.resourceType.value}</>
          ),
          sorter: true
      },
      {
          title: 'Resursa paveids',
          dataIndex: 'resourceSubType',
          key: 'resourceSubType',
          width: 150,
          render: (_: any, record: DataType) => (
              <>{record.resourceSubType.value}</>
          ),
          sorter: true
      },
      {
          title: 'Sociālais statuss',
          dataIndex: 'socialStatus',
          key: 'socialStatus',
          className: '!whitespace-nowrap',
          render: (status: string, record: DataType) => (
            <div className='flex gap-1'>
              <Badge status={status ? 'success' : 'error'} text={status ? "Atbilst" : "Neatbilst"} />
              {record.socialStatusApproved !== null && (
                <>
                  {record.socialStatusApproved ? <CheckOutlined /> : <StopOutlined />}
                </>
              )}
            </div>
          ),
          sorter: true
      },
      {
          title: 'Pieteikuma statuss',
          dataIndex: 'applicationStatus',
          key: 'applicationStatus',
          sorter: true,
          render: (_: any, record: DataType) => (
              <>{record.applicationStatus.value}</>
          ),
      },
      {
          title: 'Pieteikuma kontakttālrunis',
          dataIndex: 'contactPerson',
          key: 'contactPerson',
          sorter: true,
          render: (contactPerson: DataType['contactPerson'], record: DataType) => (
              <>{contactPerson?.contacts.map(person => (
                person.contactType.code === 'phone_number' ? person.contactValue : null
              ))}</>
          ),
      },
      {
          title: 'Kontakta epasta adrese',
          dataIndex: 'contactPersonEmail',
          key: 'contactPersonEmail',
          sorter: true,
          render: (_: any, record: DataType) => (
              <>{record?.contactPerson?.contacts.map(person => (
                person.contactType.code === 'email' ? person.contactValue : null
              ))}</>
          ),
      },
      {
          title: 'Klase/grupa',
          dataIndex: 'resourceTargetPersonClassGrade',
          key: 'resourceTargetPersonClassGrade',
          render: (resourceTargetPersonClassGrade: number, record: DataType) => (
              <>{`${resourceTargetPersonClassGrade || ''}${record.resourceTargetPersonClassParallel || ''}`}</>
          ),
      },
      {
          title: 'Izglītības programma',
          dataIndex: 'resourceTargetPersonEducationalProgram',
          key: 'resourceTargetPersonEducationalProgram',
          width: 150,
          sorter: true
      },
      {
          title: 'Izglītības apakšstatuss',
          dataIndex: 'resourceTargetPersonEducationalSubStatus',
          key: 'resourceTargetPersonEducationalSubStatus',
          sorter: true,
      },
      {
          title: 'Resursa lietotāja statuss',
          dataIndex: 'resourceTargetPersonWorkStatus',
          key: 'resourceTargetPersonWorkStatus',
          render: (resourceTargetPersonWorkStatus: any, record: DataType) => (
              resourceTargetPersonWorkStatus || record.resourceTargetPersonEducationalStatus
                  ? (resourceTargetPersonWorkStatus?.value ?? record?.resourceTargetPersonEducationalStatus?.value)
                  : null

          ),
      },
      {
          title: 'Vadoša iestāde',
          dataIndex: 'supervisor',
          key: 'supervisor',
          width: 250,
          render: (supervisor: any, record: DataType) => (
              supervisor.name
          ),
          sorter: true
      },
      {
          title: 'P/N akts',
          dataIndex: 'applicationResource',
          key: 'applicationResource',
          width: 250,
          render: (applicationResource: DataType['applicationResource']) => (
            applicationResource?.pnaNumber ? <Link href={`/admin/pnakts/${applicationResource.id}`}>{applicationResource?.pnaNumber}</Link> : null
          ),
      },
  ];

  const [columns, setColumns] = useState<ColumnsType<DataType>>(defaultColumns);
  const [userFilterOptions, setUserFilterOptions] = useState<any[]>([]);

  const router = useRouter();
  const pageTopRef = useRef(null);

  const { data: sessionData } = useSession();

  const userPermissions: string[] = sessionData?.user?.permissions || []
  const editPermission: boolean = userPermissions.includes('application.edit')

  const {
    data: logs,
    appendData: refetchWithUpdatedData,
    isLoading,
    refetch
  } = useQueryApiClient({
    request: {
      url: '/applications',
      data: filter
    },
  });

  const {
    data: profileData,
    refetch: refetchUserProfile,
    isLoading: filtersLoading
  } = useQueryApiClient({
    request: {
      url: `/userProfile/${sessionData?.user?.profileId}`,
    },
    onSuccess: (profileData: UserProfile) => {
      if (profileData && profileData.configurationInfo) {
        const configurationInfo = JSON.parse(profileData.configurationInfo)
        if (configurationInfo.applicationsColumns) {
          const newColumns: ColumnsType<DataType> = []
          configurationInfo.applicationsColumns.map((column: SortableTableItem) => {
            if (column.isEnabled) {
              const foundColumn = defaultColumns.find(c => c.key === column.key)
              if (foundColumn) {
                newColumns.push(foundColumn)
              }
            }
          })
          setColumns(newColumns)
        }

                if (configurationInfo.applicationsFilters) {
                    const newFilters: any[] = []
                    configurationInfo.applicationsFilters.map((filter: any) => {
                        if (filter.isEnabled) {
                            newFilters.push(filter)
                        }
                    })
                    setUserFilterOptions(newFilters)
                }
            }
        }
    });

  const {appendData: editApplication, isLoading: isEditLoading} = useQueryApiClient({
    request: {
      url: '/applications/:appId',
      method: 'PUT'
    },
    onSuccess: () => {
      refetch()
    }
  });

  const {
    appendData: rejectApplications
  } = useQueryApiClient({
    request: {
      url: `/applications/decline/:notifyContactPersons`,
      method: 'PUT',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      setRejectedModalIsOpen(false)
      refetchWithUpdatedData(filter)
      setSelectedRowKeys([])
      setSelectedIdsForReject([])
    },
    handleDefaultError: false,
    onError: (error: any) => {
      if (error.message === "application.statusChangeForbidden"){
        handleError({ error: 'Nav atļauts atteikt vienu/vairākus pieteikumus' })
      } else {
        handleError({ error: DEFAULT_ERROR_MESSAGE })
      }
    }
  });

  const {
    appendData: deleteApplications
  } = useQueryApiClient({
    request: {
      url: `/applications/:notifyContactPersons`,
      method: 'DELETE',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      setDeleteModalIsOpen(false)
      refetchWithUpdatedData(filter)
      setSelectedRowKeys([])
      setSelectedIdsForReject([])
    },
    handleDefaultError: false,
    onError: (error: any) => {
      if (error.message === "application.statusChangeForbidden"){
        handleError({ error: 'Nav atļauts izdzēst vienu/vairākus pieteikumus' })
      } else {
        handleError({ error: DEFAULT_ERROR_MESSAGE })
      }
    }
  });

  const openDeleteModal = (ids: string[] | React.Key[] = selectedRowKeys) => {
    if (ids.length === 0) {
      handleError({error: 'Nav izvēlēts neviens ieraksts'})
      return
    }

    setDeleteModalIsOpen(true)
    setSelectedIdsForDelete(ids as string[])
  }

  const openRejectModal = (ids: string[] | React.Key[] = selectedRowKeys) => {
    if (ids.length === 0) {
      handleError({error: 'Nav izvēlēts neviens ieraksts'})
      return
    }

    setRejectedModalIsOpen(true)
    setSelectedIdsForReject(ids as string[])
  }

  const items = (record: DataType) => {
    return {
      items: [
        {
          key: '1',
          label: (
            <button
              type="button"
              onClick={() => openRejectModal([record.id])}
            >
              Atteikt
            </button>
          ),
        },
        {
          key: '2',
          label: (
            <button
              type="button"
              onClick={() => openDeleteModal([record.id])}
            >
              Dzēst
            </button>
          ),
        },
      ].filter(Boolean),
    };
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    sorter: SorterResult<DataType>,
  ) => {
    const newFilter: ApplicationsFilterType = {
      ...filter,
      // @ts-ignore
      sort: sorter?.field ?? undefined,
      sortDir: sorter.order
        ? (sorter.order === 'ascend') ? 0 : 1
        : undefined,
      page: pagination?.current as number,
      take: pagination?.pageSize as number
    };
    setSelectedRowKeys([])
    setFilter(newFilter);
    refetchWithUpdatedData(newFilter)
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

    return (
        <div className="flex flex-col gap-y-[10px]">
            <ApplicationFilters
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: ApplicationsFilterType) => {
                    refetchWithUpdatedData(newFilters)
                    setSelectedRowKeys([])
                }}
                userFilterOptions={userFilterOptions}
                setChangeFiltersModalIsOpen={setChangeFiltersModalIsOpen}
                defaultApplicationStatusIds={defaultApplicationStatusIds}
                defaultSupervisorIds={defaultSupervisorIds}
                filtersLoading={filtersLoading}
            />
            <div ref={pageTopRef} className="bg-white rounded-lg p-6">
                <div className="justify-end flex gap-2">
                    {editPermission &&
                        <ButtonWithIcon
                            event={() => {
                                goToUrl('/admin/application/new', router)
                            }}
                            label="Izveidot pieteikumu"
                        />
                    }

                    <Button onClick={() => setChangeSequenceModalIsOpen(true)}>
                        <ControlOutlined/>
                        Konfigurēt sarakstu
                    </Button>

                    {changeFiltersModalIsOpen &&
                        <ChangeFiltersModal
                            setModalOpen={setChangeFiltersModalIsOpen}
                            profileData={profileData}
                            refetchUserProfile={() => {
                              deleteFilterValuesFromLocalStorage('applications-')
                              refetchUserProfile()
                            }}
                            />}
                    {changeSequenceModalIsOpen &&
                        <ChangeSequenceModal
                          setModalOpen={setChangeSequenceModalIsOpen}
                          profileData={profileData}
                          refetchUserProfile={refetchUserProfile}
                        />}
                </div>
                <div className='overflow-auto'>
                    <Table
                        rowSelection={{
                            selectedRowKeys,
                            onChange: onSelectChange,
                        }}
                        loading={isLoading}
                        columns={[
                            ...columns,
                            // This needs to be stored individually, cause otherwise, it uses old state values
                            {
                                title: actionsDropdown,
                                dataIndex: 'operation',
                                key: 'operation',
                                width: '150px',
                                fixed: 'right',
                                className: '!text-[#1890FF]',
                                render: (_: any, record: DataType) => {
                                    return <>
                                        {(editPermission && [APPLICANT_STATUS_SUBMITTED, APPLICANT_STATUS_POSTPONED].includes(record?.applicationStatus?.id)) ?
                                            (
                                                <Dropdown.Button
                                                    onClick={() => goToUrl(`/admin/application/${record.id}`, router)}
                                                    menu={items(record)}
                                                >
                                                    Atvērt
                                                </Dropdown.Button>
                                            )
                                            :
                                            (
                                                <Button
                                                    onClick={() => goToUrl(`/admin/application/${record.id}`, router)}
                                                >
                                                    Atvērt
                                                </Button>
                                            )
                                        }
                                    </>
                                },
                            },
                        ]}
                        dataSource={logs?.items}
                        pagination={{
                            locale: {items_per_page: '/ Lapā'},
                            current: filter.page,
                            total: logs?.total,
                            defaultPageSize: filter.take,
                            pageSizeOptions: [25, 50, 75],
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} no ${total} ierakstiem`,
                            onChange: (page, takeLimit) => {
                              setFilter(prev => ({...prev, page: prev.page !== page ? page : 1}))
                                handleScroll(pageTopRef.current);
                                setSelectedRowKeys([])
                            },
                        }}
                        onChange={(pagination, _, sorter) => handleTableChange(pagination, sorter as SorterResult<DataType>)}
                        rowKey={(record) => record.id}
                        scroll={{x: 'max-content'}}
                    />
                </div>
                {(rejectedModalIsOpen && selectedIdsForReject) &&
                    <RejectApplicationModal
                        setModalOpen={setRejectedModalIsOpen}
                        ids={selectedIdsForReject}
                        isLoading={isEditLoading}
                        submitAction={(notifyContactPersons: boolean, rejectReason: string, applicationIds: string[]) => {
                            rejectApplications({
                                applicationIds: applicationIds,
                                reason: rejectReason
                            }, {notifyContactPersons: notifyContactPersons})
                        }
                        }
                    />
                }
                {(deleteModalIsOpen && selectedIdsForDelete) &&
                    <DeleteApplicationModal
                        setModalOpen={setDeleteModalIsOpen}
                        ids={selectedIdsForDelete}
                        isLoading={isEditLoading}
                        submitAction={(notifyContactPersons: boolean, applicationIds: string[]) => {
                            deleteApplications(applicationIds, {notifyContactPersons: notifyContactPersons})
                        }
                        }
                    />
                }
                {exportModalIsOpen &&
                    <ExportModal
                        data={logs?.items}
                        initialColumns={defaultColumns.map(col => ({
                            key: col.key as string,
                            name: col.title as string,
                            isEnabled: true
                        }))}
                        setModalOpen={setExportModalIsOpen}
                        exportFunction={createApplicationListExcelFile}
                        url="/applications"
                        filters={{
                            ...filter,
                            page: 1,
                            take: 50
                        }}
                    />
                }
            </div>
        </div>
    );
};

export { Applications };
