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
import { EDUCATIONAL_INSTITUTION_STATUS_ACTIVE, EDUCATIONAL_INSTITUTION_STATUS_DISABLED, EDUCATIONAL_INSTITUTION_STATUS_DISCONTINUED } from '../../application/new/components/applicantConstants';
import { Supervisor, SupervisorListFilter, SupervisorList as SupervisorListType } from '@/app/types/Supervisor';
import SupervisorFilters from './SupervisorFilters';
import { SorterResult } from 'antd/es/table/interface';
import { DownOutlined } from '@ant-design/icons';
import ExportModal from '../../applications/components/ExportModal';
import { createSupervisorListExcelFile } from '@/app/utils/utils';

export const initialValues = {
    page: 1,
    take: AppConfig.takeLimit,
};

const SupervisorList = () => {
    const [filter, setFilter] = useState<SupervisorListFilter>(initialValues)
    const [exportModalIsOpen, setExportModalIsOpen] = useState<boolean>(false)

    const pageTopRef = useRef(null);

    const {
        data: supervisors,
        appendData: refetchWithUpdatedData,
        refetch,
        isLoading,
      } = useQueryApiClient({
        request: {
          url: '/supervisors/list',
          data: filter
        },
    });

    const {
        appendData: updateSupervisor,
        isLoading: isUpdateLoading,
      } = useQueryApiClient({
        request: {
          url: '/supervisors/:id',
          method: 'PUT'
        },
        onSuccess: () => {
            refetchWithUpdatedData(filter)
        }
    });

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

    const columns: ColumnsType<SupervisorListType> = [
        {
            title: 'Vadošā iestāde',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: SupervisorListType) => <Link href={`/admin/supervisor/${record.id}`}>{name}</Link>,
            sorter: true
        },
        {
            title: 'Statuss',
            dataIndex: 'status',
            key: 'status',
            render: (status: SupervisorListType['status'], record: SupervisorListType) => (
                <>{status ? 'Aktīvs' : 'Neaktīvs'}</>
            ),
            sorter: true
        },
        {
            title: 'Aktīvas izglītības iestādes',
            dataIndex: 'educationalInstitutions',
            key: 'educationalInstitutions',
            render: (educationalInstitutions: SupervisorListType['educationalInstitutions'], record: SupervisorListType) => (
                <>{record.activeEducationalInstitutions} no {educationalInstitutions}</>
            )
        },
        {
            title: actionsDropdown,
            dataIndex: 'operation',
            key: 'operation',
            render: (_: any, record: SupervisorListType) => {
                if (record.status) {
                    return (
                        <Button
                            onClick={() => {
                                updateSupervisor({
                                    code: record.code,
                                    name: record.name,
                                    isActive: false
                                }, {id: record.id})
                            }}
                        >
                            Bloķēt
                        </Button>
                    )
                } else {
                    return (
                        <Button
                        onClick={() => {
                            updateSupervisor({
                                code: record.code,
                                name: record.name,
                                isActive: true
                            }, {id: record.id})
                        }}
                        >
                            Aktivizēt
                        </Button>
                    )
                }
            }
        }
    ]

    const handleTableChange = (
        pagination: TablePaginationConfig,
        sorter: SorterResult<SupervisorListType>,
      ) => {
        const newFilter: SupervisorListFilter = {
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
            <SupervisorFilters 
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: SupervisorListFilter) => {
                    refetchWithUpdatedData(newFilters)
                    // setSelectedRowKeys([])
                }}
            />
            <div ref={pageTopRef}>
                <div className='overflow-auto'>
                <Table
                    loading={isLoading}
                    columns={columns}
                    dataSource={supervisors?.items}
                    // dataSource={educationalInstitutions?.items}
                    pagination={{
                        current: filter.page,
                        total: supervisors?.total,
                        onChange: (page, takeLimit) => {
                            //fetchRecords(page, takeLimit);
                        },
                    }}
                    rowKey={(record) => record.id}
                    onChange={(pagination, _, sorter) => handleTableChange(pagination, sorter as SorterResult<SupervisorListType>)}
                />
                </div>
            </div>
            {exportModalIsOpen &&
                <ExportModal
                    data={supervisors?.items}
                    initialColumns={columns.slice(0, -1).map(col => ({
                        key: col.key as string,
                        name: col.title as string,
                        title: col.title as string,
                        isEnabled: true
                    }))}
                    setModalOpen={setExportModalIsOpen}
                    exportFunction={createSupervisorListExcelFile}
                    url="/supervisors/list"
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

export default SupervisorList