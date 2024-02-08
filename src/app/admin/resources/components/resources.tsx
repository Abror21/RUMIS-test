'use client';

import {
    Dropdown,
    Form,
    Modal,
    Table,
    Button, Badge,
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {AppConfig, resourceStatuses} from '@/app/utils/AppConfig';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import {createResourceListExcelFile, deleteFilterValuesFromLocalStorage, goToUrl, handleScroll, isJson} from '@/app/utils/utils';
import {ButtonWithIcon} from '@/app/components/buttonWithIcon';
import {ClassifierTermType} from '@/app/admin/classifiers/components/classifierTerms';
import type {SelectProps} from 'antd';
import {useSession} from 'next-auth/react';
import SearchSelectInput from '@/app/components/searchSelectInput';
import ResourceFilters from './ResourceFilters';
import {ResourceFilterType} from '@/app/types/Resource';
import nProgress from 'nprogress';
import {UserProfile} from '@/app/types/UserProfile';
import ChangeFiltersModal from './ChangeFiltersModal';
import {SortableTableItem} from '@/app/components/SortableTable';
import ChangeSequenceModal from './ChangeSequenceModal';
import Link from 'next/link';
import {CheckOutlined, CloseOutlined, ControlOutlined, DownOutlined} from "@ant-design/icons";
import ExportModal from '../../applications/components/ExportModal';
import ResourceImportModal from './ResourceImportModal';
import useHandleError, { DEFAULT_ERROR_MESSAGE } from '@/app/utils/useHandleError';
import DeleteResourcesModal from './DeleteResourcesModal';

export const initialValues = {
    page: 1,
    take: AppConfig.takeLimit,
};

const {confirm} = Modal;


interface DataType {
    id: string;
    code: string;
    value: string;
}

interface EducationalInstitutionType {
    id: string;
    code: string;
    name: string;
}

interface ResourceType {
    id: string;
    resourceNumber: string;
    resourceName: string;
    modelIdentifier: string;
    acquisitionsValue: number;
    manufactureYear: number;
    inventoryNumber: string;
    serialNumber: string;
    resourceStatusHistory: string;
    notes: string;
    educationalInstitution: EducationalInstitutionType;
    resourceSubType: DataType;
    resourceGroup: DataType;
    resourceStatus: DataType;
    resourceLocation: DataType;
    targetGroupId: DataType;
    acquisitionTypeId: DataType;
    manufacturer: DataType;
    modelName: DataType;
    socialSupportResource: boolean | null;
}

interface QueryData {
    educationalInstitutionId: string | number | undefined;
    resourceTypeId: string | number | undefined;
    resourceSubTypeId: string | number | undefined;
}

const Resources = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [resourceTypes, setResourceTypes] = useState<{
        label: string,
        value: string,
        code: string
    }[]>([])
    const [resourceSubTypes, setResourceSubTypes] = useState<{
        label: string,
        value: string,
        code: string
    }[]>([])
    const [filteredResourceSubTypes, setFilteredResourceSubTypes] = useState<{
        label: string,
        value: string,
        code: string
    }[]>([])
    const [changeFiltersModalIsOpen, setChangeFiltersModalIsOpen] = useState<boolean>(false)
    const [changeSequenceModalIsOpen, setChangeSequenceModalIsOpen] = useState<boolean>(false);
    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');
    const [exportModalIsOpen, setExportModalIsOpen] = useState<boolean>(false);
    const [importModalIsOpen, setImportModalIsOpen] = useState<boolean>(false);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedIdsForDelete, setSelectedIdsForDelete] = useState<string[] | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams()

    const defaultSupervisorIds = searchParams.get('supervisorIds')
    const defaultResourceStatusIds = searchParams.getAll('resourceStatusIds')
    const defaultUsagePurposeTypeIds = searchParams.get('usagePurposeTypeIds')
    const defaultEducationalInstitutionIds = searchParams.get('educationalInstitution')

    const [id, setId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const resourceType = Form.useWatch('resourceTypeId', form)

    const pageTopRef = useRef(null);

    const [handleError] = useHandleError()

    const {data: sessionData} = useSession();

    const dataFromLocalStorage: any = {}
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('resources-')) {
            const value = localStorage.getItem(key)
            const parsedKey = key.replace('resources-', '') 
            if (isJson(value as string)) {
                dataFromLocalStorage[parsedKey] = JSON.parse(value as string)
            } else {
                dataFromLocalStorage[parsedKey] = value
            }
        }
    }
    const [filter, setFilter] = useState<ResourceFilterType>(
        {
            ...initialValues,
            ...dataFromLocalStorage,
            supervisorIds: defaultSupervisorIds ? [defaultSupervisorIds] : undefined,
            resourceStatusIds: defaultResourceStatusIds ? defaultResourceStatusIds : undefined,
            educationalInstitutionIds: defaultEducationalInstitutionIds ? defaultEducationalInstitutionIds : undefined,
            usagePurposeTypeIds: defaultUsagePurposeTypeIds ? [defaultUsagePurposeTypeIds] : undefined,
        }
    );
    const [userFilterOptions, setUserFilterOptions] = useState<any[]>([]);

    useEffect(() => {
        if (resourceType) {
            // @ts-ignore
            const filteredValues = resourceSubTypes.filter(type => type?.resourceType === JSON.parse(resourceType).code)
            setFilteredResourceSubTypes(filteredValues)
        }
    }, [resourceType])

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
        onSuccess: () => {
            setSelectedRowKeys([])
        }
    });

    useEffect(() => {
        //  appendData(filter)
    }, [])

    const {
        appendData: createAppendData,
        isLoading: postLoader
    } = useQueryApiClient({
        request: {
            url: '/resources',
            method: 'POST',
        },
        onSuccess: () => {
            setId(null);
            setModalOpen(false);
            form.resetFields();
            refetch();
        },
    });

    const {data: educationalInstitutions} = useQueryApiClient({
        request: {
            url: '/educationalInstitutions',
        },
    });

    const {appendData: deleteAppendData} = useQueryApiClient({
        request: {
            url: `/resources/:id`,
            method: 'DELETE',
        },
        onSuccess: () => {
            setId(null);
            refetch();
        },
    });

    useQueryApiClient({
        request: {
        url: '/classifiers/getByType',
        method: 'GET',
        data: {
            types: ['resource_type', 'resource_subtype'],
            includeDisabled: true,
        },
        enableOnMount: true,
        },
        onSuccess: (response) => {
            const group = response.reduce((result: SelectProps, item: ClassifierTermType) => {
                let resource_type;
                if (item.payload && item.type === "resource_subtype") {
                    resource_type = JSON.parse(item?.payload)?.resource_type;
                }
            })
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

    useQueryApiClient({
        request: {
            url: '/classifiers/getByType',
            method: 'GET',
            data: {
                types: ['resource_type', 'resource_subtype'],
                includeDisabled: true,
            },
            enableOnMount: true,
        },
        onSuccess: (response) => {
            const group = response.reduce((result: SelectProps, item: ClassifierTermType) => {
                    let resource_type;
                    if (item.payload && item.type === 'resource_subtype') {
                        resource_type = JSON.parse(item?.payload)?.resource_type;
                    }
                    return {
                        ...result,
                        [item['type']]: [
                            //@ts-ignore
                            ...(result[item['type']] || []),
                            {
                                label: item.value,
                                value: item.id,
                                code: item.code,
                                resourceType: resource_type
                            },
                        ],
                    }
                },
                {},
            );
            setResourceTypes(group.resource_type)
            setResourceSubTypes(group.resource_subtype)
            setFilteredResourceSubTypes(group.resource_subtype)
        },
    });

    const {
        appendData: deleteResources
      } = useQueryApiClient({
        request: {
          url: `/resources`,
          method: 'DELETE',
          data: {},
          disableOnMount: true
        },
        onSuccess: () => {
          setDeleteModalIsOpen(false)
          refetchWithUpdatedData(filter)
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

    const fetchRecords = (page: number, pageSize: number) => {
        const newPage = page !== filter.page ? page : 1;
        const newFilter = { ...filter, page: newPage, take: pageSize };
        setFilter(newFilter);
        refetchWithUpdatedData(newFilter);
    };

    const items = (record: ResourceType) => {
        return {
            items: [
                {
                    key: '1',
                    label: (
                        <button type="button" onClick={() => goToUrl(`/admin/resource/${record.id}/edit`, router)}>
                            Labot
                        </button>
                    ),
                },
                {
                    key: '2',
                    label: (
                        <button type="button" onClick={() => openDeleteModal([record.id])}>
                            Dzēst
                        </button>
                    ),
                },
            ],
        };
    };

    const initialColumns: ColumnsType<ResourceType> = [
        {
            title: 'Resursa kods',
            dataIndex: 'resourceNumber',
            key: 'resourceNumber',
            className: 'font-semibold',
            render: (_: any, record: ResourceType) => <Link
                href={`/admin/resource/${record.id}`}>{record.resourceNumber}</Link>
        },
        {
            title: 'Sērijas Nr.',
            dataIndex: 'serialNumber',
            key: 'serialNumber',
        },
        {
            title: 'Inventāra Nr.',
            dataIndex: 'inventoryNumber',
            key: 'inventoryNumber',
        },
        {
            title: 'Iestādes piešķirtais nosaukums',
            dataIndex: 'resourceName',
            key: 'resourceName',
            width: 200
        },
        {
            title: 'Ražotājs',
            dataIndex: 'manufacturer',
            key: 'manufacturer',
            render: (record: any) => (
                <>{record.value}</>
            ),
        },
        {
            title: 'Ražotāja nosaukums',
            dataIndex: 'manufacturerName',
            key: 'manufacturerName',
            render: (_: any, record: ResourceType) => (
                <>{record.manufacturer.value}</>
            ),
        },
        {
            title: 'Modelis',
            dataIndex: 'modelIdentifier',
            key: 'modelIdentifier',
        },
        {
            title: 'Resursa paveids',
            dataIndex: 'resourceSubType',
            key: 'resourceSubType',
            render: (record: DataType) => (
                <>{record.value}</>
            ),
            width: 200
        },
        {
            title: 'Statuss',
            dataIndex: 'resourceStatus',
            key: 'resourceStatus',
            render: (record: DataType) => {
                return <Badge color={resourceStatuses.find(el => el.code === record.code)?.color} text={record.value}/>
            },
            className: '!whitespace-nowrap',
        },
        {
            title: 'Atrašanās vieta',
            dataIndex: 'resourceLocation',
            key: 'resourceLocation',
            render: (record: DataType) => (
                <>{record.value}</>
            ),
        },
        {
            title: 'Resursa veids',
            dataIndex: 'resourceType',
            key: 'resourceType',
            width: 150,
            render: (record: DataType) => (
                <>{record.value}</>
            ),
        },
        {
            title: 'Ražošanas gads',
            dataIndex: 'manufactureYear',
            key: 'manufactureYear',
            render: (manufactureYear: any) => <>{manufactureYear ? manufactureYear : null}</>
        },
        {
            title: 'Resursu grupa',
            dataIndex: 'resourceGroup',
            key: 'resourceGroup',
            render: (resourceGroup: any) => <>{resourceGroup?.value}</>,
            width: 150
        },
        {
            title: 'Vadoša iestāde',
            dataIndex: 'resourceType',
            key: 'resourceType',
            render: (resourceType: any) => <>{resourceType?.value}</>,
        },
        {
            title: 'Izglītības iestāde',
            dataIndex: 'educationalInstitution',
            key: 'educationalInstitution',
            render: (educationalInstitution: any) => <>{educationalInstitution?.name}</>,
            width: 200
        },
        {
            title: 'Iegādes veids',
            dataIndex: 'acquisitionType',
            key: 'acquisitionType',
            render: (acquisitionType: any) => <>{acquisitionType?.value}</>,
        },
        {
            title: 'Sociālā atbalsta resurss',
            dataIndex: 'socResurss',
            key: 'socResurss',
            render: (_: any, record: ResourceType) => {
                if (record.socialSupportResource === true) return <CheckOutlined />
                if (record.socialSupportResource === false) return <CloseOutlined />
            }
        },
        {
            title: 'Izmantošanas mērķis',
            dataIndex: 'usagePurposeType',
            key: 'usagePurposeType',
            render: (usagePurposeType: any) => <>{usagePurposeType?.value}</>,
        },
        {
            title: 'Mērķa grupa',
            dataIndex: 'targetGroup',
            key: 'targetGroup',
            render: (targetGroup: any) => <>{targetGroup?.value}</>,
            width: 150
        },
        {
            title: 'Iegādes vērtība (ar PVN)',
            dataIndex: 'acquisitionsValue',
            key: 'acquisitionsValue',
            render: (acquisitionsValue: any) => <>{acquisitionsValue} eiro</>,
        },
    ];

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
                if (configurationInfo.resourceColumns) {
                    const newColumns: ColumnsType<ResourceType> = []
                    configurationInfo.resourceColumns.map((column: SortableTableItem) => {
                        if (column.isEnabled) {
                            const foundColumn = initialColumns.find(c => c.key === column.key)
                            if (foundColumn) {
                                newColumns.push(foundColumn)
                            }
                        }
                    })
                    setColumns(newColumns)
                }

                if (configurationInfo.resourceFilters) {
                    const newFilters: any[] = []
                    configurationInfo.resourceFilters.map((filter: any) => {
                        if (filter.isEnabled) {
                            newFilters.push(filter)
                        }
                    })
                    setUserFilterOptions(newFilters)
                }
            }
        }
    });

    const { refetch: downloadImportTemplate } = useQueryApiClient({
        request: {
          url: `/resources/downloadImportTemplate`,
          method: 'GET',
          disableOnMount: true,
          multipart: true
        },
        handleDefaultError: false,
        onSuccess: async (response) => {
            var link = document.createElement('a')
            link.href = window.URL.createObjectURL(response)
            link.download = `Šablons.xlsx`
            link.click()
        },
        onError: (error) => {
            handleError({error: 'Šablons neeksistē'})
        }
      });

    const [columns, setColumns] = useState<ColumnsType<ResourceType>>(initialColumns)

    const handleCancel = () => {
        setModalOpen(false);
        form.resetFields();
    };

    const createResource = async () => {
        await form.validateFields();
        const formData: QueryData = {...form.getFieldsValue(true)};
        const {educationalInstitutionId = '', resourceTypeId = '', resourceSubTypeId = ''} = formData;

        form.resetFields();
        nProgress.start()
        goToUrl(`/admin/resource/new?educationalInstitutionId=${educationalInstitutionId}&resourceTypeId=${resourceTypeId && JSON.parse(resourceTypeId as string).id}&resourceSubTypeId=${resourceSubTypeId}`, router)
        setModalOpen(false);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      };

    const actionsDropdown = (
        <Dropdown menu={{
            items: [
                {
                    key: '1',
                    label: (
                        <div onClick={() => openDeleteModal()}>Dzēst atzīmētos</div>
                    ),
                },
                {
                    key: '2',
                    label: (
                        <div onClick={() => setExportModalIsOpen(true)}>Eksportēt sarakstu</div>
                    ),
                },
                {
                    key: '3',
                    label: (
                        <div onClick={() => setImportModalIsOpen(true)}>Importēt resursus</div>
                    ),
                },
                {
                    key: '4',
                    label: (
                        <div onClick={() => downloadImportTemplate()}>Lejupielādēt importa šablonu</div>
                    ),
                },
            ]
        }
        }
        >
            <span className='cursor-pointer'>Darbības <DownOutlined/></span>
        </Dropdown>
    )

    const initialFormValues = useMemo(() => {
        if (sessionData?.user?.permissionType === 'EducationalInstitution') {
            return {
                educationalInstitutionId: sessionData?.user?.educationalInstitutionId
            }
        }
        return {}
    }, [])

    return (
        <div className="flex flex-col gap-y-[10px]">
            <ResourceFilters
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: ResourceFilterType) => {
                    refetchWithUpdatedData(newFilters)
                    // setSelectedRowKeys([])
                }}
                userFilterOptions={userFilterOptions}
                setChangeFiltersModalIsOpen={setChangeFiltersModalIsOpen}
                defaultResourceStatusIds={defaultResourceStatusIds ?? []}
                defaultSupervisorIds={defaultSupervisorIds}
                defaultUsagePurposeTypeIds={defaultUsagePurposeTypeIds}
                defaultEducationalInstitutionIds={defaultEducationalInstitutionIds}
                filtersLoading={filtersLoading}
            />
            <div className="bg-white rounded-lg p-6">
                <div className="justify-end flex gap-2">
                    <ButtonWithIcon
                        event={() => setModalOpen(true)}
                        label="Pievienot jaunu resursu"
                    />

                    <Button onClick={() => setChangeSequenceModalIsOpen(true)}>
                        <ControlOutlined/>
                        Konfigurēt
                    </Button>

                    {changeFiltersModalIsOpen &&
                        <ChangeFiltersModal
                            setModalOpen={setChangeFiltersModalIsOpen}
                            profileData={profileData}
                            refetchUserProfile={() => {
                                deleteFilterValuesFromLocalStorage('resources-')
                                refetchUserProfile()
                            }}
                        />
                    }
                    {changeSequenceModalIsOpen &&
                        <ChangeSequenceModal
                            setModalOpen={setChangeSequenceModalIsOpen}
                            profileData={profileData}
                            refetchUserProfile={refetchUserProfile}
                        />
                    }
                </div>
                <div ref={pageTopRef}>
                    <div className='overflow-auto'>
                        <Table
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
                                    render: (_: any, record: ResourceType) => {
                                        return (
                                            <Dropdown.Button
                                                onClick={() => goToUrl(`/admin/resource/${record.id}`, router)}
                                                menu={items(record)}
                                            >
                                                Skatīt
                                            </Dropdown.Button>
                                        );
                                    },
                                }
                            ]}
                            dataSource={resources?.items}
                            pagination={{
                                locale: {items_per_page: '/ Lapā'},
                                current: filter.page,
                                total: resources?.total,
                                defaultPageSize: filter.take,
                                pageSizeOptions: [25, 50, 75],
                                showSizeChanger: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} no ${total} ierakstiem`,
                                onChange: (page, takeLimit) => {
                                    fetchRecords(page, takeLimit);
                                    handleScroll(pageTopRef.current);
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
                </div>
            </div>
            <Modal
                title='Jauns resurss'
                centered
                open={modalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Atcelt
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={postLoader}
                        onClick={createResource}
                    >
                        Izveidot
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" initialValues={initialFormValues}>
                    <Form.Item
                        label="Izglītības iestāde"
                        name="educationalInstitutionId"
                        rules={[{required: true, message: "Izglītības iestāde ir obligāts lauks."}]}
                    >
                        <SearchSelectInput
                            options={educationalInstitutions.map((institution: any) => ({
                                label: institution?.name,
                                value: institution?.id,
                            }))}
                            placeholder="Izglītības iestāde"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Resursa veids"
                        name="resourceTypeId"
                        rules={[{required: true, message: "Resursa veids ir obligāts lauks."}]}
                    >
                        <SearchSelectInput
                            options={resourceTypes?.map(type => ({
                                label: type?.label,
                                value: JSON.stringify({code: type?.code, id: type?.value}),
                            }))}
                            placeholder="Resursa veids"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Resursa paveids"
                        name="resourceSubTypeId"
                        rules={[{required: true, message: "Resursa paveids ir obligāts lauks."}]}
                    >
                        <SearchSelectInput
                            options={filteredResourceSubTypes.map(subtype => ({
                                label: subtype?.label,
                                value: subtype?.value,
                            }))}
                            placeholder="Resursa paveids"
                        />
                    </Form.Item>
                </Form>
            </Modal>
            {exportModalIsOpen &&
                <ExportModal
                    data={resources?.items}
                    initialColumns={initialColumns.map(col => ({
                        key: col.key as string,
                        name: col.title as string,
                        isEnabled: true
                    }))}
                    setModalOpen={setExportModalIsOpen}
                    exportFunction={createResourceListExcelFile}
                    url="/resources"
                    filters={{
                        ...filter,
                        page: 1,
                        take: 50
                    }
                    }
                />
            }
            {importModalIsOpen &&
                <ResourceImportModal
                    setModalOpen={setImportModalIsOpen}
                    refetchWithUpdatedData={() => refetchWithUpdatedData(filter)}
                />
            }
            {(deleteModalIsOpen && selectedIdsForDelete) &&
                    <DeleteResourcesModal
                        setModalOpen={setDeleteModalIsOpen}
                        ids={selectedIdsForDelete}
                        isLoading={false}
                        submitAction={(notifyContactPersons: boolean, applicationIds: string[]) => {
                            deleteResources(applicationIds, {notifyContactPersons: notifyContactPersons})
                        }
                        }
                    />
                }
        </div>
    );
};

export {Resources};
