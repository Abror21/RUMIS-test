import {ResourceFilterType, Resource as ResourceType} from '@/app/types/Resource';
import { AppConfig } from '@/app/utils/AppConfig';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { Button, Table, Typography } from 'antd';
import Link from 'next/link';
import { Dispatch, SetStateAction, useState } from 'react';
import ResourceCopyFilters from '../ResourceCopyFilters';

export const initialValues = {
    page: 1,
    take: AppConfig.takeLimit,
};

type FirstStepProps = {
    resource: ResourceType | null,
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    setStep: Dispatch<SetStateAction<0 | 1>>,
    selectedRowKeys: React.Key[],
    setSelectedRowKeys: Dispatch<SetStateAction<React.Key[]>>,
}

const { Title } = Typography;

const FirstStep = ({resource, setModalOpen, setStep, selectedRowKeys, setSelectedRowKeys}: FirstStepProps) => {
    const [filter, setFilter] = useState<ResourceFilterType>(initialValues)
    
    const columns = [
        {
            title: 'Resursa kods',
            dataIndex: 'resourceNumber',
            key: 'resourceNumber',
            className: 'font-semibold',
            render: (_: any, record: ResourceType) => <Link
                href={`/admin/resource/${record.id}`}>{record.resourceNumber}</Link>
        },
        {
            title: 'Ražotāja nosaukums',
            dataIndex: 'manufacturerName',
            key: 'manufacturerName',
            render: (_: any, record: ResourceType) => (
                <>{record?.manufacturer?.value}</>
            ),
        },
        {
            title: 'Modelis',
            dataIndex: 'modelName',
            key: 'modelName',
            render: (record: any) => (
                <>{record.value}</>
            ),
        },
        {
            title: 'Ražotājs',
            dataIndex: 'manufacturer',
            key: 'manufacturer',
            render: (record: any) => (
                <>{record.code}</>
            ),
        },
        {
            title: 'Inventāra Nr.',
            dataIndex: 'inventoryNumber',
            key: 'inventoryNumber',
        },
        {
            title: 'Nosaukums (iestādes)',
            dataIndex: 'educationalInstitution',
            key: 'educationalInstitution',
            render: (record: any) => (
                <>{record.name}</>
            ),
            width: 200
        },
    ]

    const {
        data: resources,
        appendData: refetchWithUpdatedData,
        refetch,
        isLoading,
    } = useQueryApiClient({
        request: {
            url: '/resources',
            data: filter
        },
    });
    
    const fetchRecords = (page: number, pageSize: number) => {
        const newPage = page !== filter.page ? page : 1;
        const newFilter = { ...filter, page: newPage, take: pageSize };
        setFilter(newFilter);
        refetchWithUpdatedData(newFilter);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      };

    return (
        <div>
            <Title level={4}>Aizpildāmie resursi</Title>
            <ResourceCopyFilters 
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: ResourceFilterType) => {
                    refetchWithUpdatedData(newFilters)
                    setSelectedRowKeys([])
                }}
                resource={resource}
            />
            <div className='overflow-auto'>
                <Table
                    loading={isLoading}
                    columns={columns}
                    dataSource={resources?.items}
                    pagination={{
                        current: filter.page,
                        total: resources?.total,
                        defaultPageSize: filter.take,
                        pageSizeOptions: [25, 50, 75],
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} no ${total} ierakstiem`,
                        onChange: (page, takeLimit) => {
                            fetchRecords(page, takeLimit);
                        },
                    }}
                    rowKey={(record) => record.id}
                    scroll={{x: 'max-content'}}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                />
            </div>
            <div className='flex justify-between'>
                <Button onClick={() => {setModalOpen(false)}}>Atcelt</Button>
                <Button type="primary" onClick={() => setStep(1)}>Tālāk</Button>
            </div>
        </div>
    )   
}

export default FirstStep