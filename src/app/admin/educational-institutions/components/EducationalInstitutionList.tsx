'use client';

import {
  Dropdown,
  Table,
  Button,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {useEffect, useRef, useState} from 'react';
import { AppConfig } from '@/app/utils/AppConfig';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import Link from 'next/link';
import { EducationalInstitutionFilter, EducationalInstitution as EducationalInstitutionType } from '@/app/types/EducationalInstitution';
import EducationalInstitutionFilters from './EducationalInstitutionFilters';
import { EDUCATIONAL_INSTITUTION_STATUS_ACTIVE, EDUCATIONAL_INSTITUTION_STATUS_DISABLED, EDUCATIONAL_INSTITUTION_STATUS_DISCONTINUED } from '../../application/new/components/applicantConstants';
import { useSession } from 'next-auth/react';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import { createEduListExcelFile, goToUrl, isJson } from '@/app/utils/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { SorterResult } from 'antd/es/table/interface';
import { DownOutlined } from '@ant-design/icons';
import ExportModal from '../../applications/components/ExportModal';

export const initialValues = {
    page: 1,
    take: AppConfig.takeLimit,
};

const EducationalInstitutionList = () => {
    const searchParams = useSearchParams()

    const defaultSupervisorIds = searchParams.get('supervisorIds')
    const defaultEducationalInstitutionStatusIds = searchParams.get('educationalInstitutionStatusIds')
    const defaultEducationalInstitution = searchParams.get('educationalInstitution')
    const dataFromLocalStorage: any = {}
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('educational_institution-')) {
            const value = localStorage.getItem(key)
            const parsedKey = key.replace('educational_institution-', '') 
            if (isJson(value as string)) {
                dataFromLocalStorage[parsedKey] = JSON.parse(value as string)
            } else {
                dataFromLocalStorage[parsedKey] = value
            }
        }
    }
    
    const [filter, setFilter] = useState<EducationalInstitutionFilter>({
        ...initialValues,
        ...dataFromLocalStorage,
        ...(defaultSupervisorIds ? { supervisorIds: [+defaultSupervisorIds] } : {}),
  ...(defaultEducationalInstitution ? { educationalInstitutionIds: [+defaultEducationalInstitution] } : {}),
  ...(defaultEducationalInstitutionStatusIds ? { educationalInstitutionStatusIds: defaultEducationalInstitutionStatusIds } : {}),
    })

    const [exportModalIsOpen, setExportModalIsOpen] = useState<boolean>(false)
    
    const pageTopRef = useRef(null);
    const { data: sessionData } = useSession();
    const router = useRouter();

    const {
        data: educationalInstitutions,
        appendData: refetchWithUpdatedData,
        refetch,
        isLoading,
      } = useQueryApiClient({
        request: {
          url: '/educationalInstitutions/list',
          data: filter
        },
    });

    const {
        appendData: updateEducationalInstitution,
        isLoading: isUpdateLoading,
      } = useQueryApiClient({
        request: {
          url: '/educationalInstitutions/:id',
          method: 'PUT'
        },
        onSuccess: () => {
            refetchWithUpdatedData(filter)
        }
    });

    const changeStatus = (educationalInstitution: EducationalInstitutionType, status: string) => {
        updateEducationalInstitution({
            code: educationalInstitution.code,
            name: educationalInstitution.name,
            supervisorId: educationalInstitution.supervisor.id,
            statusId: status,
            educationalInstitutionContactPersons: educationalInstitution.educationalInstitutionContactPersons
        }, {id: educationalInstitution.id})
    }

    const actionsDropdown = (
        <Dropdown menu={{ items: [
          {
            key: '1',
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

    const columns: ColumnsType<EducationalInstitutionType> = [
        {
            title: 'Izglītības iestādes nosaukums',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (name: string, record: EducationalInstitutionType) => <Link href={`/admin/educational-institution/${record.id}`}>{name}</Link>
        },
        {
            title: 'Statuss',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status: EducationalInstitutionType['status'], record: EducationalInstitutionType) => status.value
        },
        {
            title: 'Vadošā iestāde',
            dataIndex: 'supervisorName',
            key: 'supervisorName',
            sorter: true,
            render: (_: any, record: EducationalInstitutionType) => <Link href={`/admin/supervisor/${record?.supervisor.id}`}>{record?.supervisor.name}</Link>
        },
        {
            title: actionsDropdown,
            dataIndex: 'operation',
            key: 'operation',
            width: '150px',
            render: (_: any, record: EducationalInstitutionType) => {
                switch (record.status.id) {
                    case EDUCATIONAL_INSTITUTION_STATUS_DISABLED:
                        return (
                            <Button
                                onClick={() => changeStatus(record, EDUCATIONAL_INSTITUTION_STATUS_ACTIVE)}
                            >
                                Aktivizēt
                            </Button>
                        );
                    case EDUCATIONAL_INSTITUTION_STATUS_ACTIVE:
                        return (
                            <Button
                                onClick={() => changeStatus(record, EDUCATIONAL_INSTITUTION_STATUS_DISABLED)}
                            >
                                Bloķēt
                            </Button>
                        );
                    case EDUCATIONAL_INSTITUTION_STATUS_DISCONTINUED:
                        return (
                            <Dropdown.Button
                                menu={items(record)}
                                onClick={() => changeStatus(record, EDUCATIONAL_INSTITUTION_STATUS_ACTIVE)}
                            >
                                Aktivizēt
                            </Dropdown.Button>
                        );
                }
            },
        }
    ]

    const items = (record: EducationalInstitutionType) => {
        return {
          items: [
            {
              key: '1',
              label: (
                <button type="button" onClick={() => changeStatus(record, EDUCATIONAL_INSTITUTION_STATUS_DISABLED)}>
                  Bloķēt
                </button>
              ),
            },
          ],
        };
      };

    const fetchRecords = (page: number, pageSize: number) => {
        const newFilter = { ...filter, page, take: pageSize };
        setFilter(newFilter);
        refetchWithUpdatedData(newFilter);
    };

    const handleTableChange = (
        pagination: TablePaginationConfig,
        sorter: SorterResult<EducationalInstitutionType>,
    ) => {
        const newFilter: any = {
            ...filter,
            // @ts-ignore
            sort: sorter?.field ?? undefined,
            sortDir: sorter.order
                ? (sorter.order === 'ascend') ? 0 : 1
                : undefined,
            page: pagination?.current as number,
            take: pagination?.pageSize as number
        };
        setFilter(newFilter);
        refetchWithUpdatedData(newFilter)
    };

    return (
        <div>
            <EducationalInstitutionFilters 
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: EducationalInstitutionFilter) => {
                    refetchWithUpdatedData(newFilters)
                }}
                defaultEducationalInstitutionStatusIds={defaultEducationalInstitutionStatusIds}
                defaultEducationalInstitution={defaultEducationalInstitution}
                defaultSupervisorIds={defaultSupervisorIds}
            />
            <div ref={pageTopRef}>
                <div className='overflow-auto'>
                <Table
                    loading={isLoading || isUpdateLoading}
                    columns={columns}
                    dataSource={educationalInstitutions?.items}
                    pagination={{
                        locale: {items_per_page: '/ Lapā'},
                        current: educationalInstitutions.page,
                        total: educationalInstitutions?.total,
                        defaultPageSize: filter.take,
                        pageSizeOptions: [25, 50, 75],
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} no ${total} ierakstiem`,
                        onChange: (page, takeLimit) => {
                            fetchRecords(page, takeLimit);
                        },
                    }}
                    rowKey={(record) => record.id}
                    onChange={(pagination, _, sorter) => handleTableChange(pagination, sorter as SorterResult<EducationalInstitutionType>)}
                />
                </div>
            </div>
            {exportModalIsOpen &&
                <ExportModal
                    data={educationalInstitutions?.items}
                    initialColumns={columns.slice(0, -1).map(col => ({
                        key: col.key as string,
                        name: col.title as string,
                        title: col.title as string,
                        isEnabled: true
                    }))}
                    setModalOpen={setExportModalIsOpen}
                    exportFunction={createEduListExcelFile}
                    url="/educationalInstitutions/list"
                    filters={{
                        ...filter,
                        page: 1,
                        take: 50
                    }}
                />
            }
        </div>
    )
}

export default EducationalInstitutionList