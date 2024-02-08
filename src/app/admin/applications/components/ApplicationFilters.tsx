import {Button, DatePicker, Form, Input, Row, Spin, Tabs, TabsProps} from "antd"
import {useForm} from "antd/es/form/Form"
import {ApplicationsFilterType, initialValues} from "./applications"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import {ClassifierTermType} from "../../classifiers/components/classifierTerms"
import dayjs from "dayjs"
import {mmDdYyFormat} from "@/app/utils/AppConfig"
import SearchSelectInput from "@/app/components/searchSelectInput"
import React, {useEffect, useMemo, useState} from "react"
import {ClassifierResponse} from "@/app/types/Classifiers"
import {Supervisor} from "@/app/types/Supervisor"
import {EducationalInstitution} from "@/app/types/EducationalInstitution"
import {SettingOutlined} from "@ant-design/icons";
import { addFilterValuesToLocalStorage, deleteFilterValuesFromLocalStorage, isJson } from "@/app/utils/utils"

type ApplicationFiltersProps = {
    activeFilters: ApplicationsFilterType,
    filterState: (val: ApplicationsFilterType) => void
    refresh: (val: ApplicationsFilterType) => void,
    userFilterOptions: any[],
    setChangeFiltersModalIsOpen: (value: boolean) => void,
    defaultApplicationStatusIds?: string | null,
    defaultSupervisorIds?: string | null,
    filtersLoading: boolean;
}

const {RangePicker} = DatePicker;

const ApplicationFilters = ({activeFilters, filterState, refresh, userFilterOptions, setChangeFiltersModalIsOpen, defaultSupervisorIds, defaultApplicationStatusIds, filtersLoading}: ApplicationFiltersProps) => {
    const [allSubTypes, setAllSubTypes] = useState<ClassifierResponse[]>([])
    const [filteredSubTypes, setFilteredSubTypes] = useState<ClassifierResponse[]>([])
    const [allEducationalInstitution, setAllEducationalInstitution] = useState<EducationalInstitution[]>([])
    const [filteredEducationalInstitution, setFilteredEducationalInstitution] = useState<EducationalInstitution[]>([])
    const [filterList, setFilterList] = useState<any[]>([])
    const [showTabs, setShowTabs] = useState<boolean>(false);
    const [activeTabKey, setActiveTabKey] = useState<string>('userSettings');

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

    const filterListHandle = (filterOptions: any[]) => {
        const newFilterOptions: any[] = []
        filterOptions.map(filterOption => {
            if (allFilterOptions.find(o => o.key === filterOption.key)) {
                newFilterOptions.push(allFilterOptions.find(o => o.key === filterOption.key))
            }
        })
        setFilterList(newFilterOptions)
    }

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
        data: applicationStatuses
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'application_status',
                includeDisabled: false
            }

        },
    });

    const {
        data: submitterTypeIds
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'applicant_role',
                includeDisabled: false
            }

        },
    });

    const {
        data: socialStatuses
    } = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'social_status',
                includeDisabled: false
            }

        },
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

    const onReset = () => {
        form.setFieldsValue({
            resourceTargetPerson: null,
            resourceTargetPersonTypeIds: null,
            submitterPerson: null,
            resourceType: null,
            applicationStatusIds: [],
            supervisorIds: null,
            applicationDate: [],
            workEducationStatus: null,
            resourceSubTypeIds: null,
            submitterTypeIds: null,
            applicationSocialStatusIds: null,
            educationalInstitutionIds: null,
            applicationNumber: null,
            contactPhone: null,
            contactEmail: null,
            resourceTargetPersonEducationalProgram: null,
            resourceTargetPersonEducationalSubStatus: null,
            hasDuplicate: null,
            resourceTargetPersonClass: null,
            applicationSocialStatusApprovedIds: [],

        });

        filterState({
            ...initialValues,
            take: activeFilters.take,
        })
        refresh({
            ...initialValues,
            take: activeFilters.take,
        })
    }


    const allFilterOptions: any[] = [
        {
            name: 'Resursa lietotājs',
            key: 'resourceTargetPerson',
            render: () => (<Form.Item name="resourceTargetPerson" label="Resursa lietotājs">
                <Input placeholder="Vārds uzvārds, personas kods" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja tips',
            key: 'resourceTargetPersonTypeIds',
            render: () => (<Form.Item name="resourceTargetPersonTypeIds" label="Resursa lietotāja tips">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    options={applicantRoles.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                    allowClear
                />
            </Form.Item>)
        },
        {
            name: 'Pieteikuma iesniedzējs',
            key: 'submitterPerson',
            render: () => (<Form.Item name="submitterPerson" label="Pieteikuma iesniedzējs">
                <Input placeholder="Vārds uzvārds, personas kods" allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa veids',
            key: 'resourceType',
            render: () => (<Form.Item name="resourceType" label="Resursa veids">
                <SearchSelectInput
                    placeholder="Sāc rakstīt un izvēlies no saraksta"
                    allowClear
                    options={types.map((item: ClassifierTermType) => ({
                    label: item.value,
                    value: item.code,
                    code: item.code
                }))}/>
            </Form.Item>)
        },
        {
            name: 'Pieteikuma statuss',
            key: 'applicationStatusIds',
            render: () => (<Form.Item name="applicationStatusIds" label="Pieteikuma statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={applicationStatuses.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
          mode="multiple"
                />
            </Form.Item>)
        },
        {
            name: 'Vadošā iestāde',
            key: 'supervisorIds',
            render: () => (<Form.Item name="supervisorIds" label="Vadošā iestāde">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
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
            name: 'Iesniegšanas periods',
            key: 'applicationDate',
            render: () => (<Form.Item name="applicationDate" label="Iesniegšanas periods">
                <RangePicker allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja statuss',
            key: 'workEducationStatus',
            render: () => (<Form.Item name="workEducationStatus" label="Resursa lietotāja statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={workEducationStatus.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                />
            </Form.Item>)
        },
        {
            name: 'Pieteikuma iesniedzēja loma',
            key: 'resourceSubTypeIds',
            render: () => (<Form.Item name="submitterTypeIds" label="Pieteikuma iesniedzēja loma">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={submitterTypeIds.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                />
            </Form.Item>),
        },
        {
            name: 'Resursa paveids',
            key: 'submitterTypeIds',
            render: () => (<Form.Item name="resourceSubTypeIds" label="Resursa paveids">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={filteredSubTypes.map((item: ClassifierResponse) => ({
                    label: item.value,
                    value: item.id,
                    code: item.code
                }))}/>
            </Form.Item>)
        },
        {
            name: 'Sociālais statuss',
            key: 'applicationSocialStatusIds',
            render: () => (<Form.Item name="applicationSocialStatusIds" label="Sociālais statuss">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    allowClear
                    options={socialStatuses.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                />
            </Form.Item>),
        },
        {
            name: 'Izglītības iestāde',
            key: 'educationalInstitutionIds',
            render: () => (<Form.Item name="educationalInstitutionIds" label="Izglītības iestāde">
                <SearchSelectInput
                    placeholder="Nosaukums, reģistrācijas numurs"
                    allowClear
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
            }}/>
            </Form.Item>)
        },
        {
            name: 'Pieteikuma numurs',
            key: 'applicationNumber',
            render: () => (<Form.Item name="applicationNumber" label="Pieteikuma numurs">
                <Input allowClear/>
            </Form.Item>)
        },
        {
            name: 'Kontakttālrunis',
            key: 'contactPhone',
            render: () => (<Form.Item name="contactPhone" label="Kontakttālrunis">
                <Input allowClear/>
            </Form.Item>)
        },
        {
            name: 'Kontakta epasts',
            key: 'contactEmail',
            render: () => (<Form.Item name="contactEmail" label="Kontakta epasts">
                <Input allowClear/>
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja izglītības programma',
            key: 'resourceTargetPersonEducationalProgram',
            render: () => (
                <Form.Item name="resourceTargetPersonEducationalProgram" label="Resursa lietotāja izglītības programma">
                    <Input allowClear/>
                </Form.Item>)
        },
        {
            name: 'Izglītības apakšstatuss',
            key: 'resourceTargetPersonEducationalSubStatus',
            render: () => ( <Form.Item name="resourceTargetPersonEducationalSubStatus" label="Izglītības apakšstatuss">
            <Input allowClear/>
            </Form.Item>)
        },
        {
            name: 'Pazīme par analoģisku resursa paveidu',
            key: 'hasDuplicate',
            render: () => ( <Form.Item name="hasDuplicate" label="Pazīme par analoģisku resursa paveidu">
                <SearchSelectInput
                    allowClear
                    options={[
                        {
                            label: 'Jā',
                            value: 1
                        },
                        {
                            label: 'Nē',
                            value: 0
                        },
                    ]}
                />
            </Form.Item>)
        },
        {
            name: 'Resursa lietotāja atbilstība sociālajai statusa grupai',
            key: 'applicationSocialStatusApprovedIds',
            render: () => (<Form.Item name="applicationSocialStatusApprovedIds" label="Resursa lietotāja atbilstība sociālajai statusa grupai">
                <SearchSelectInput
                    placeholder="Izvēlies no saraksta"
                    options={socialStatuses.map((item: ClassifierTermType) => ({
                        label: item.value,
                        value: item.id,
                        code: item.code
                    }))}
                    mode="multiple"
                    allowClear
                />
            </Form.Item>),
        },
        {
            name: 'Resursa lietotāja klase/grupa',
            key: 'resourceTargetPersonClass',
            render: () => (<Form.Item name="resourceTargetPersonClass" label="Resursa lietotāja klase/grupa">
                <Input allowClear />
            </Form.Item>),
        },
    ]

    const onFinish = (values: any) => {
        const filters: ApplicationsFilterType = {
            ...activeFilters,
            ...initialValues,
            take: activeFilters.take,
            submitterPerson: values.submitterPerson,
            resourceTargetPersonTypeIds: values.resourceTargetPersonTypeIds,
            resourceTargetPerson: values.resourceTargetPerson,
            resourceSubTypeIds: values.resourceSubTypeIds,
            applicationStatusIds: values.applicationStatusIds,
            submitterTypeIds: values.submitterTypeIds,
            applicationSocialStatusIds: values.applicationSocialStatusIds,
            applicationSocialStatusApprovedIds: values.applicationSocialStatusApprovedIds,
            educationalInstitutionIds: values.educationalInstitutionIds,
            applicationNumber: values.applicationNumber,
            contactPhone: values.contactPhone,
            contactEmail: values.contactEmail,
            resourceTargetPersonEducationalProgram: values.resourceTargetPersonEducationalProgram,
            resourceTargetPersonClass: values.resourceTargetPersonClass,
            resourceTargetPersonEducationalStatusIds: undefined,
            resourceTargetPersonWorkStatusIds: undefined,
            hasDuplicate: values.hasDuplicate !== undefined ? Boolean(values.hasDuplicate) : undefined,
            applicationDateFrom: (values.applicationDate && values.applicationDate[0]) ? dayjs(values.applicationDate[0]).format(mmDdYyFormat) : undefined,
            applicationDateTo: (values.applicationDate && values.applicationDate[1]) ? dayjs(values.applicationDate[1]).format(mmDdYyFormat) : undefined,
        }

        if (values.workEducationStatus) {
            const chosenOption = workEducationStatus.find((o: ClassifierResponse) => o.id === values.workEducationStatus)
            if (chosenOption) {
                if (chosenOption.type === 'resource_target_person_educational_status') {
                    filters.resourceTargetPersonEducationalStatusIds = values.workEducationStatus
                } else {
                    filters.resourceTargetPersonWorkStatusIds = values.workEducationStatus
                }
            }
        }

        addFilterValuesToLocalStorage(filters, 'applications-')

        filterState(filters)
        refresh(filters)
    }

    const tabItems: TabsProps['items'] = [
        {
            key: 'userSettings',
            label: 'Mans saglabātais filtrs',
            children: ''
        },
        {
            key: 'defaultSettings',
            label: 'Noklusējuma meklētājs',
            children: ''
        }
    ]

    const onTabChange = (key: string) => {
        // onReset();
        setActiveTabKey(key);
        key == 'userSettings' ? filterListHandle(userFilterOptions) : filterListHandle(allFilterOptions)
    };

    const initialData = useMemo(() => {
        if (defaultSupervisorIds || defaultApplicationStatusIds) {
            return {
                supervisorIds: defaultSupervisorIds ? +defaultSupervisorIds : null,
                applicationStatusIds: defaultApplicationStatusIds ?? [],
            }
        }

        const dataFromLocalStorage: any = {}
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('applications-')) {
                const value = localStorage.getItem(key)
                const parsedKey = key.replace('applications-', '')
                if (parsedKey === 'applicationDateTo' || parsedKey === 'applicationDateFrom') {
                    if (dataFromLocalStorage['applicationDate']) {
                        dataFromLocalStorage['applicationDate'][parsedKey === 'applicationDateFrom' ? 0 : 1] = dayjs(value)
                    } else {
                        dataFromLocalStorage['applicationDate'] = []
                        dataFromLocalStorage['applicationDate'][parsedKey === 'applicationDateFrom' ? 0 : 1] = dayjs(value)
                    }

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
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                            {filterList.map(filter => (
                                <React.Fragment key={filter.key}>
                                    {filter.render()}
                                </React.Fragment>
                            ))}
                        </div>
                        <Row>
                            <div className='flex gap-2'>
                                <Button type="primary" htmlType="submit">
                                    Atlasīt
                                </Button>
                                <Button htmlType="button" onClick={() => {
                                    onReset()
                                    deleteFilterValuesFromLocalStorage('applications-')
                                }}>
                                    Atcelt
                                </Button>
                            </div>
                            <div className="ml-auto">
                                <Button onClick={() => setChangeFiltersModalIsOpen(true)}>
                                    <SettingOutlined/>
                                    Konfigurēt meklētāju
                                </Button>
                            </div>
                        </Row>
                    </Form>
                </Spin>
            </div>
        )
}

export default ApplicationFilters

