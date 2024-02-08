import {Button, DatePicker, Dropdown, Form, Input, Row, Select, Spin, Tabs, TabsProps} from "antd"
import {useForm} from "antd/es/form/Form"
// import { ApplicationsFilterType, initialValues } from "./applications"
import {PnActsFilterType, initialValues} from './pnakti'
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import {ClassifierTermType} from "../../classifiers/components/classifierTerms"
import dayjs from "dayjs"
import {dateFormat, dateRequestFormat, mmDdYyFormat} from "@/app/utils/AppConfig"
import SearchSelectInput from "@/app/components/searchSelectInput"
import {useEffect, useMemo, useState} from "react"
import {ClassifierResponse} from "@/app/types/Classifiers"
import {EducationalInstitution} from "@/app/types/EducationalInstitution"
import {Supervisor} from "@/app/types/Supervisor"
import React from "react"
import {SettingOutlined} from "@ant-design/icons";
import { addFilterValuesToLocalStorage, deleteFilterValuesFromLocalStorage, isJson } from "@/app/utils/utils"

type PnActsFiltersProps = {
    activeFilters: PnActsFilterType,
    filterState: (val: PnActsFilterType) => void
    refresh: (val: PnActsFilterType) => void,
    userFilterOptions: any[],
    setChangeFiltersModalIsOpen: (value: boolean) => void,
    filtersLoading: boolean;
}

const {RangePicker} = DatePicker;

const PnActsFilters = ({filtersLoading, activeFilters, filterState, refresh, userFilterOptions, setChangeFiltersModalIsOpen}: PnActsFiltersProps) => {
    const [allSubTypes, setAllSubTypes] = useState<ClassifierResponse[]>([])
    const [filteredSubTypes, setFilteredSubTypes] = useState<ClassifierResponse[]>([])

    const [allEducationalInstitution, setAllEducationalInstitution] = useState<EducationalInstitution[]>([])
    const [filteredEducationalInstitution, setFilteredEducationalInstitution] = useState<EducationalInstitution[]>([])

    const [showTabs, setShowTabs] = useState<boolean>(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('userSettings');
    const [filterList, setFilterList] = useState<any[]>([])

    const [form] = useForm()
    const resourceType = Form.useWatch('resourceType', form)
    const resourceSubTypeIds = Form.useWatch('resourceSubTypeIds', form)
    const supervisor = Form.useWatch('supervisor', form)
    const educationalInstitutionIds = Form.useWatch('educationalInstitutionIds', form)

    useEffect(() => {
        if (userFilterOptions.length > 0) {
            // onReset();
            setShowTabs(true);
            setActiveTabKey('userSettings');
            filterListHandle(userFilterOptions);
        }
        else {
            // onReset();
            filterListHandle(allFilterOptions);
        }
    }, [userFilterOptions])

    useEffect(() => {
        if (resourceType) {
            // @ts-ignore
            const filteredValues = allSubTypes.filter(type => type.payload.resource_type === resourceType)
            setFilteredSubTypes(filteredValues)

            if (!filteredValues.find(v => v.id === resourceSubTypeIds)) {
                form.setFieldValue('resourceSubTypeIds', null)
            }
        }
    }, [resourceType])

    useEffect(() => {
        if (supervisor) {
            const filteredValues = allEducationalInstitution.filter(edu => edu.supervisor.id === supervisor)
            setFilteredEducationalInstitution(filteredValues)

            if (!filteredValues.find(v => v.id === educationalInstitutionIds)) {
                form.setFieldValue('educationalInstitutionIds', null)
            }
        }
    }, [supervisor])

    useEffect(() => {
        activeTabKey === 'userSettings' && userFilterOptions.length > 0 ? filterListHandle(userFilterOptions) : filterListHandle(allFilterOptions);
    }, [filteredSubTypes, filteredEducationalInstitution])

    const {
        data: types
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_type',
                includeDisabled: false
            }

        },
    });

    const {
        data: subTypes
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_subtype',
                includeDisabled: false
            }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            const parsedResponse = response.map(item => {
                // @ts-ignore
                const payloadObj = JSON.parse(item.payload);
                return {
                    ...item,
                    payload: payloadObj
                };
            });
            setAllSubTypes(parsedResponse)
            setFilteredSubTypes(parsedResponse)
        }
    });

    const {
        data: supervisors
    } = useQueryApiClient({
        request: {
            url: `/supervisors`,
        },
    });

    const {} = useQueryApiClient({
        request: {
            url: `/educationalInstitutions`,
        },
        onSuccess: (response: EducationalInstitution[]) => {
            setAllEducationalInstitution(response)
            setFilteredEducationalInstitution(response)
        }
    });

    const {
        data: resourceStatus
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_status',
                includeDisabled: false
            }

        },
    });

    const {
        data: pnaStatus
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'pna_status',
                includeDisabled: false
            }

        },
    });

    const {
        data: applicantRoles
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_target_person_type',
                includeDisabled: false
            }

        },
    });

    const {
        data: workEducationStatus
    } = useQueryApiClient({
        request: {
            url: `/classifiers/getbytype`,
            data: {
                types: ['resource_target_person_educational_status', 'resource_target_person_work_status'],
                includeDisabled: false
            }
        },
    });

    const {
        data: resourceReturnStatus
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_return_status',
                includeDisabled: false
            }
        },
    });

    const allFilterOptions: any[] = [
        {
            name: 'Resursa nosaukums',
            key: 'resourceName',
            render: () => (<Form.Item name="resourceName" label="Resursa nosaukums">
                <Input placeholder="Resursa nosaukums" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa numurs',
            key: 'resourceNumber',
            render: () => (<Form.Item name="resourceNumber" label="Resursa numurs">
                <Input placeholder="JVSK-LEN0068" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotājs',
            key: 'resourceTargetPerson',
            render: () => (<Form.Item name="resourceTargetPerson" label="Resursa lietotājs">
                <Input placeholder="Vārds uzvārds, personas kods " allowClear/>
            </Form.Item>)
        },
        {
            name: 'Saskaņotājs',
            key: 'conciliator',
            render: () => (<Form.Item name="conciliator" label="Saskaņotājs">
                <Input placeholder="Vārds uzvārds, personas kods" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Dokumenta datums',
            key: 'documentDate',
            render: () => (<Form.Item name="documentDate" label="Dokumenta datums">
                <RangePicker allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa veids',
            key: 'resourceType',
            render: () => (<Form.Item name="resourceType" label="Resursa veids">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={types.map((item: ClassifierTermType) => ({
                    label: item.value,
                    value: item.code,
                    code: item.code
                }))}/>
            </Form.Item>)
        },
        {
            name: 'Vadošā iestāde',
            key: 'supervisor',
            render: () => (<Form.Item name="supervisor" label="Vadošā iestāde">
                <SearchSelectInput
                    allowClear
                    placeholder="Izvēlies no saraksta"
                    options={supervisors.map((item: Supervisor) => ({
                    value: item.id,
                    label: item.name,
                rest: item.code
              }))}
              // @ts-ignore
              filterOption={(input: string, option?: { label: string; value: string, rest: string }) => {
                const restMatch = (option?.rest ?? '').toLowerCase().includes(input.toLowerCase());
                const labelMatch = (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

                return restMatch || labelMatch;
              }}
                />
            </Form.Item>)
        },
        {
            name: 'Resursa sērijas numurs',
            key: 'serialNumber',
            render: () => (<Form.Item name="serialNumber" label="Resursa sērijas numurs">
                <Input placeholder="PF0F89B7" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja tips',
            key: 'resourceTargetPersonTypeIds',
            render: () => (<Form.Item name="resourceTargetPersonTypeIds" label="Resursa lietotāja tips">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={applicantRoles.map((applicantRoleItem: ClassifierTermType) => ({
                        label: applicantRoleItem.value,
                        value: applicantRoleItem.id,
                        code: applicantRoleItem.code
                    }))}
                />
            </Form.Item>)
        },
        {
            name: 'Saskaņotājs iestādē',
            key: 'conciliatorEducation',
            render: () => (<Form.Item name="conciliatorEducation" label="Saskaņotājs iestādē">
                <Input placeholder="Vārds uzvārds, personas kods" allowClear/>
            </Form.Item>)
        },
        {
            name: 'P/N akta statuss',
            key: 'pnaStatus',
            render: () => (<Form.Item name="pnaStatus" label="P/N akta statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={pnaStatus.map((applicantRoleItem: ClassifierTermType) => ({
                        label: applicantRoleItem.value,
                        value: applicantRoleItem.id,
                        code: applicantRoleItem.code
                    }))}
                    mode="multiple"
                />
            </Form.Item>)
        },
        {
            name: 'Resursa paveids',
            key: 'resourceSubTypeIds',
            render: () => (<Form.Item name="resourceSubTypeIds" label="Resursa paveids">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={filteredSubTypes.map((item: ClassifierResponse) => ({
                        label: item.value,
                        value: item.id,
                        rest: item.code
                    }))}
                />
            </Form.Item>)
        },
        {
            name: 'Izglītības iestāde',
            key: 'educationalInstitutionIds',
            render: () => (<Form.Item name="educationalInstitutionIds" label="Izglītības iestāde">
                <SearchSelectInput
                    allowClear
                    placeholder="Izvēlies no saraksta"
                    options={filteredEducationalInstitution.map(item => ({
                    value: item.id,
                    label: item.name,
                rest: item.code
              }))}
              // @ts-ignore
              filterOption={(input: string, option?: { label: string; value: string, rest: string }) => {
                const restMatch = (option?.rest ?? '').toLowerCase().includes(input.toLowerCase());
                const labelMatch = (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

                return restMatch || labelMatch;
              }}
                />
            </Form.Item>)
        },
        {
            name: 'Inventāra numurs',
            key: 'inventoryNumber',
            render: () => (<Form.Item name="inventoryNumber" label="Inventāra numurs">
                <Input placeholder="AS-PF0-2" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Atgriešanas datums',
            key: 'returnDate',
            render: () => (<Form.Item name="returnDate" label="Atgriešanas datums">
                <RangePicker allowClear/>
            </Form.Item>)
        },
        {
            name: 'Izsniegts atšķirīgs',
            key: 'resourceDiffer',
            render: () => (<Form.Item name="resourceDiffer" label="Izsniegts atšķirīgs">
                <Select
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={[
                        {
                            value: true,
                            label: 'Jā'
                        },
                        {
                            value: false,
                            label: 'Nē'
                        },
                    ]}
                />
            </Form.Item>)
        },
        {
            name: 'Termiņš',
            key: 'dueDate',
            render: () => (<Form.Item name="dueDate" label="Termiņš">
                <RangePicker allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja statuss',
            key: 'resourceTargetStatus',
            render: () => (<Form.Item name="resourceTargetStatus" label="Resursa lietotāja statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={workEducationStatus.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                    mode="multiple"
                />
            </Form.Item>)
        },
        {
            name: 'Atgriešanas statuss',
            key: 'returnResourceStateIds',
            render: () => (<Form.Item name="returnResourceStateIds" label="Atgriešanas statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={resourceReturnStatus.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                    mode="multiple"
                />
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja klase grupa',
            key: 'resourceTargetPersonClass',
            render: () => (<Form.Item name="resourceTargetPersonClass" label="Resursa lietotāja klase grupa">
                <Input />
            </Form.Item>)
        },
    ]

    const filterListHandle = (filterOptions: any[]) => {
        const newFilterOptions: any[] = []
        filterOptions.map(filterOption => {
            if (allFilterOptions.find(o => o.key === filterOption.key)) {
                newFilterOptions.push(allFilterOptions.find(o => o.key === filterOption.key))
            }
        })
        setFilterList(newFilterOptions)
    }

    const onReset = () => {
        form.setFieldsValue({
            resourceName: null,
            resourceNumber: null,
            resourceTargetPerson: null,
            conciliator: null,
            documentDate: [],
            resourceType: null,
            supervisor: null,
            serialNumber: null,
            resourceTargetPersonTypeIds: null,
            conciliatorEducation: null,
            pnaStatus: [],
            resourceSubTypeIds: null,
            educationalInstitutionIds: null,
            inventoryNumber: null,
            returnDate: [],
            resourceDiffer: null,
            dueDate: [],
            resourceTargetStatus: [],
            returnResourceStateIds: [],
        })

        filterState(initialValues)
        refresh(initialValues)
    }

    const onFinish = (values: any) => {
        const resourceTargetPersonEducationalStatusIds: string[] = [];
        const resourceTargetPersonWorkStatusIds: string[] = [];

        workEducationStatus.forEach((item: any) => {
            if (!values.resourceTargetStatus || !values.resourceTargetStatus.find((el: string) => el === item.id)) return

            if (item.type === 'resource_target_person_educational_status') {
                resourceTargetPersonEducationalStatusIds.push(item.id);
            } else if (item.type === 'resource_target_person_work_status') {
                resourceTargetPersonWorkStatusIds.push(item.id);
            }
        });
        const filters: PnActsFilterType = {
            ...activeFilters,
            page: 1,
            resourceSubTypeIds: values.resourceSubTypeIds,
            resourceTargetPerson: values.resourceTargetPerson,
            submitterPerson: values.conciliator,
            userSetPrepared: values.conciliatorEducation,
            resourceStatus: values.resourceStatus,
            PNAStatusIds: values.pnaStatus,
            resourceNumber: values.resourceNumber,
            resourceName: values.resourceName,
            resourceTargetPersonTypeIds: values.resourceTargetPersonTypeIds,
            educationalInstitutionIds: values.educationalInstitutionIds,
            serialNumber: values.serialNumber,
            inventoryNumber: values.inventoryNumber,
            resourceDiffer: values.resourceDiffer,
            resourceTargetPersonEducationalStatusIds: resourceTargetPersonEducationalStatusIds,
            resourceTargetPersonWorkStatusIds: resourceTargetPersonWorkStatusIds,
            returnResourceStateIds: values.returnResourceStateIds,
            supervisorIds: values.supervisor,
            resourceTargetPersonClass: values.resourceTargetPersonClass,
            documentDateFrom: (values.documentDate && values.documentDate[0]) ? dayjs(values.documentDate[0]).format(mmDdYyFormat) : undefined,
            documentDateTo: (values.documentDate && values.documentDate[1]) ? dayjs(values.documentDate[1]).format(mmDdYyFormat) : undefined,
            returnDateFrom: (values.returnDate && values.returnDate[0]) ? dayjs(values.returnDate[0]).format(mmDdYyFormat) : undefined,
            returnDateTo: (values.returnDate && values.returnDate[1]) ? dayjs(values.returnDate[1]).format(mmDdYyFormat) : undefined,
            dueDateFrom: (values.dueDate && values.dueDate[0]) ? dayjs(values.dueDate[0]).format(mmDdYyFormat) : undefined,
            dueDateTo: (values.dueDate && values.dueDate[1]) ? dayjs(values.dueDate[1]).format(mmDdYyFormat) : undefined,
        }

        addFilterValuesToLocalStorage(filters, 'pna-')
        
        filterState(filters)
        refresh(filters)
    }

    const tabItems: TabsProps['items'] = [
        {
            key: 'userSettings',
            label: 'Mans saglabātais filtrs',
            children: '',
        },
        {
            key: 'defaultSettings',
            label: 'Noklusējuma meklētājs',
            children: '',
        }
    ]

    const onTabChange = (key: string) => {
        // onReset();
        setActiveTabKey(key);
        key == 'userSettings' ? filterListHandle(userFilterOptions) : filterListHandle(allFilterOptions)
    };

    const initialData = useMemo(() => {
        const dataFromLocalStorage: any = {}
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('pna-')) {
                const value = localStorage.getItem(key)
                const parsedKey = key.replace('pna-', '')
                if (parsedKey === 'documentDateTo' || parsedKey === 'documentDateFrom') {
                    if (dataFromLocalStorage['documentDate']) {
                        dataFromLocalStorage['documentDate'][parsedKey === 'documentDateFrom' ? 0 : 1] = dayjs(value)
                    } else {
                        dataFromLocalStorage['documentDate'] = []
                        dataFromLocalStorage['documentDate'][parsedKey === 'documentDateFrom' ? 0 : 1] = dayjs(value)
                    }

                    continue
                }
                if (parsedKey === 'returnDateTo' || parsedKey === 'returnDateFrom') {
                    if (dataFromLocalStorage['returnDate']) {
                        dataFromLocalStorage['returnDate'][parsedKey === 'returnDateFrom' ? 0 : 1] = dayjs(value)
                    } else {
                        dataFromLocalStorage['returnDate'] = []
                        dataFromLocalStorage['returnDate'][parsedKey === 'returnDateFrom' ? 0 : 1] = dayjs(value)
                    }

                    continue
                }
                if (parsedKey === 'dueDateTo' || parsedKey === 'dueDateFrom') {
                    if (dataFromLocalStorage['dueDate']) {
                        dataFromLocalStorage['dueDate'][parsedKey === 'dueDateFrom' ? 0 : 1] = dayjs(value)
                    } else {
                        dataFromLocalStorage['dueDate'] = []
                        dataFromLocalStorage['dueDate'][parsedKey === 'dueDateFrom' ? 0 : 1] = dayjs(value)
                    }

                    continue
                }
                if (parsedKey === 'PNAStatusIds') {
                    dataFromLocalStorage['pnaStatus'] = JSON.parse(value as string)
                    continue
                }
                if (parsedKey === 'submitterPerson') {
                    dataFromLocalStorage['conciliator'] = value
                    continue
                }
                if (parsedKey === 'userSetPrepared') {
                    dataFromLocalStorage['conciliatorEducation'] = value
                    continue
                }
                if (parsedKey === 'supervisorIds') {
                    dataFromLocalStorage['supervisor'] = value ? +value : null
                    continue
                }
                if (isJson(value as string)) {
                    dataFromLocalStorage[parsedKey] = JSON.parse(value as string)
                } else {
                    dataFromLocalStorage[parsedKey] = value
                }
            }
        }
        return dataFromLocalStorage
    }, [])

    return (
        <div className="bg-white rounded-lg p-6">
            {showTabs && <Tabs activeKey={activeTabKey} items={tabItems} onChange={onTabChange} />}
            <Spin spinning={filtersLoading}>
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={initialData}
                    // className="flex items-end gap-2"
                >
                    <div className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                            {filterList.map(filter => (
                                <React.Fragment key={filter.key}>
                                    {filter.render()}
                                </React.Fragment>
                            ))}
                        </div>
                            <Row style={{marginBottom: 0}}>
                                <div className='flex gap-2'>
                                    <Button type="primary" htmlType="submit">
                                        Atlasīt
                                    </Button>
                                    <Button htmlType="button" onClick={() => {
                                        onReset()
                                        deleteFilterValuesFromLocalStorage('pna-')
                                    }}>
                                        Notīrīt
                                    </Button>
                                </div>

                                <div className="ml-auto">
                                    <Button onClick={() => setChangeFiltersModalIsOpen(true)}>
                                        <SettingOutlined/>
                                        Konfigurēt
                                    </Button>
                                </div>
                            </Row>
                    </div>
                </Form>
            </Spin>
        </div>
    )
}

export default PnActsFilters