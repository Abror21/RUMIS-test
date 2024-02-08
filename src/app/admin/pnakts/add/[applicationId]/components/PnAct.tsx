'use client'

import { ClassifierResponse } from "@/app/types/Classifiers"
import { dateFormat, datePickerFormat } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Button, Col, DatePicker, Form, Input, Row, Select, Spin, Typography } from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import MoreResourcesModal from "./MoreResourcesModal"
import { Resource } from "@/app/types/Resource"
import { Application } from "@/app/types/Applications"
import { useRouter } from "next/navigation"
import SearchSelectInput from "@/app/components/searchSelectInput"
import { PnAct as PnActType } from "@/app/types/PnAct"
import LinkButton from "@/app/components/LinkButton"
import { goToUrl } from "@/app/utils/utils"
import { RESOURCE_STATUS_AVAILABLE, RESOURCE_TARGET_PERSON_TYPE_EMPLOYEE, RESOURCE_TARGET_PERSON_TYPE_LEARNER, TARGET_GROUP_ALL, TARGET_GROUP_EMPLOYEE, TARGET_GROUP_LEARNER, TARGET_GROUP_SOCIALLY_DISADVANTAGED_LEARNER, USING_PURPOSE_ISSUED_INDIVIDUALLY } from "@/app/admin/application/new/components/applicantConstants"
import { EducationalInstitution } from "@/app/types/EducationalInstitution"
import ContactPersonModal from "./ContactPersonModal"

const { Title } = Typography;

const { TextArea } = Input;

type PnActProps = {
    data: Application | null;
    applicationId: string;
    isAddForm: boolean;
    pnact: PnActType | null;
}

type SelectedEducationalInstitutionContactPerson = {
    id: string;
    jobPosition?: {
        id: string;
        code: string;
        value: string;
    };
    name: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    contactPersonResourceSubTypes?: {
        id: string;
        resourceSubType: {
            id: string;
            code: string;
            value: string
        }
    }[]
}

const PnAct = ({data, applicationId, isAddForm, pnact}: PnActProps) => {
    const [moreResourcesModalIsOpen, setMoreResourcesModalIsOpen] = useState<boolean>(false);
    const [allSubTypes, setAllSubTypes] = useState<ClassifierResponse[]>([])
    const [filteredSubTypes, setFilteredSubTypes] = useState<ClassifierResponse[]>([])
    const [types, setTypes] = useState<ClassifierResponse[]>([])

    const [allResourceOptions, setAllResourceOptions] = useState<Resource[]>([])
    const [filteredResourceOptions, setFilteredResourceOptions] = useState<Resource[]>([])

    const [educationalInstitutionContactPersons, setEducationalInstitutionContactPersons] = useState<SelectedEducationalInstitutionContactPerson[]>([])
    const [selectedEducationalInstitutionContactPersons, setSelectedEducationalInstitutionContactPersons] = useState<SelectedEducationalInstitutionContactPerson[]>([])
    const [contactPersonModalIsOpen, setContactPersonModalIsOpen] = useState<boolean>(false)

    const [isChangeResourceModeEnabled, setIsChangeResourceModeEnabled] = useState<boolean>(false)
    const [selectedResource, setSelectedResource] = useState<Resource | PnActType['assignedResource'] | null>(null)

    const [error, setError] = useState<string | null>(null)
    
    const router = useRouter();
    
    const [form] = Form.useForm();

    const resourceType = Form.useWatch('resourceType', form)
    const resourceSubTypeIds = Form.useWatch('resourceSubTypeIds', form)
    const resource = Form.useWatch('resource', form)
    const assignedResourceReturnDate = Form.useWatch('assignedResourceReturnDate', form)

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
        if (resourceSubTypeIds && allResourceOptions.length > 0) {
          // @ts-ignore
          const filteredValues = allResourceOptions.filter(type => type.resourceSubType.id === resourceSubTypeIds)
          setFilteredResourceOptions(filteredValues)
            
          if (!filteredValues.find(v => v.id === resource)) {
            form.setFieldValue('resource', null)
          }
        }
    }, [resourceSubTypeIds])

    useEffect(() => {
        if (data && educationalInstitutionContactPersons.length === 0) {
                getEducationalInstitutions({}, {id: data?.educationalInstitution.id})
                if (pnact) {
                    setSelectedEducationalInstitutionContactPersons(pnact?.educationalInstitutionContactPersons ? pnact?.educationalInstitutionContactPersons : [])
                }

        }
    }, [data])

    useEffect(() => {
        const resource = selectedResourceHandler()
        setSelectedResource(resource)
    }, [resource])

    useEffect(() => {
        if (isChangeResourceModeEnabled) {
            form.setFieldValue('resource', null)
        } else if (!isAddForm) {
            form.setFieldValue('resource', pnact?.assignedResource.id)
        }
    }, [isChangeResourceModeEnabled])

    const selectedResourceHandler = (): Resource | PnActType['assignedResource'] | null => {
        const resourceFromOptions = filteredResourceOptions.find(opt => opt.id === resource)

        if (resourceFromOptions) return resourceFromOptions
        if (!isAddForm) {
            return {
                ...pnact?.assignedResource,
            } as PnActType['assignedResource']
        }
        
        return null
    }

    const setInitialSelectedResource = () => {
        setSelectedResource({
            ...pnact?.assignedResource,
        } as PnActType['assignedResource'])
        setIsChangeResourceModeEnabled(false)
    }

    const onResourceChange = (value: string | null) => {
        if (isAddForm) return

        setSelectedEducationalInstitutionContactPersons(educationalInstitutionContactPersons)
    }

    const selectedSubType: ClassifierResponse | null = useMemo(() => {
        if (!resourceSubTypeIds) return null

        return filteredSubTypes.find(opt => opt.id === resourceSubTypeIds) as ClassifierResponse
    }, [resourceSubTypeIds])

    const targetGroups = useMemo(() => {
        const targetGroupIds: string[] = [TARGET_GROUP_ALL]

        if (data?.resourceTargetPersonType.id === RESOURCE_TARGET_PERSON_TYPE_LEARNER) {
            targetGroupIds.push(TARGET_GROUP_LEARNER)
            if (data?.socialStatus) {
                targetGroupIds.push(TARGET_GROUP_SOCIALLY_DISADVANTAGED_LEARNER)
            }
        }

        if (data?.resourceTargetPersonType.id === RESOURCE_TARGET_PERSON_TYPE_EMPLOYEE) {
            targetGroupIds.push(TARGET_GROUP_EMPLOYEE)
        }

        return targetGroupIds
    }, [data]) 
    const {appendData: refetchResources, isLoading: isResourceLoading} = useQueryApiClient({
        request: {
          url: '/resources',
          data: {
            resourceStatusIds: RESOURCE_STATUS_AVAILABLE,
            usagePurposeTypeIds: USING_PURPOSE_ISSUED_INDIVIDUALLY,
            targetGroupIds: targetGroups,
            educationalInstitutionIds: [data?.educationalInstitution?.id]
          }
        },
        onSuccess(response) {
            setFilteredResourceOptions(response.items)
            setAllResourceOptions(response.items)
            if (data?.resourceSubType.id) {
                const filteredValues = response.items.filter((type: any) => type.resourceSubType.id === resourceSubTypeIds)
                setFilteredResourceOptions(filteredValues)
            }
        },
    });


    const {
        data: subTypes
      } = useQueryApiClient({
        request: {
          url: `/classifiers/getByType`,
          data: {
            types: [
                'resource_type',
                'resource_subtype'
            ],
            includeDisabled: false
          }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            const newSubTypes: ClassifierResponse[] = []
            const newTypes: ClassifierResponse[] = []
            response.map(classifier => {
                if (classifier.type === 'resource_subtype') {
                    // @ts-ignore
                    const payloadObj = JSON.parse(classifier.payload);
                    newSubTypes.push({
                        ...classifier,
                        payload: payloadObj
                    })
                }
                if (classifier.type === 'resource_type') {
                    newTypes.push(classifier)
                }
            })
            setAllSubTypes(newSubTypes)
            setFilteredSubTypes(newSubTypes)
            setTypes(newTypes)

            if (data?.resourceSubType?.id) {
                // @ts-ignore
                const subType = newSubTypes.find(s => s.id === data?.resourceSubType?.id)?.payload?.resource_type
                if (subType) {
                    const type = newTypes.find(t => t.code === subType)
                    form.setFieldsValue({
                        resourceType: type?.code
                    })
                }
            }
        }
    });

    const {appendData: getEducationalInstitutions} = useQueryApiClient({
        request: {
            url: `/educationalInstitutions/:id`,
            disableOnMount: true
        },
        onSuccess(response: EducationalInstitution) {
            const persons = response.educationalInstitutionContactPersons 
            ? response.educationalInstitutionContactPersons.map(person => ({
                id: person.id,
                jobPosition: person.jobPosition,
                name: person.name,
                email: person.email,
                phoneNumber: person.phoneNumber,
                address: person.address,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes
            })) 
            : []

            // @ts-ignore
            setEducationalInstitutionContactPersons(persons)
            
            if (isAddForm) {
                // @ts-ignore
                setSelectedEducationalInstitutionContactPersons(persons.filter(person => {
                    if (person.jobPosition.code !== "ict_contact") return true

                    // @ts-ignore
                    if (person?.contactPersonResourceSubTypes) {
                        // @ts-ignore
                        if (person?.contactPersonResourceSubTypes.some(p => p.resourceSubType.id === form.getFieldValue('resourceSubTypeIds'))) {
                            return true
                        } else {
                            return false
                        }
                    }

                    return true
                }))
            }
        }
    })
    const {appendData} = useQueryApiClient({
        request: {
            url: `/applicationResources`,
            method: 'POST',
            disableOnMount: true,
            data: {}
        },
        onSuccess(response) {
            goToUrl('/admin/pnakti', router)
        }
    })

    const {appendData: editData} = useQueryApiClient({
        request: {
            url: `/applicationResources/:id`,
            method: 'PUT',
            disableOnMount: true,
            data: {}
        },
        onSuccess(response) {
            goToUrl('/admin/pnakti', router)
        }
    })

    const {appendData: appendDataAsPrepared} = useQueryApiClient({
        request: {
            url: `/applicationResources/prepared`,
            method: 'POST',
            disableOnMount: true,
            data: {}
        },
        onSuccess(response) {
            goToUrl('/admin/pnakti', router)
        }
    })

    const initialValues = useMemo(() => {
        if (isAddForm) {
            return {
                resourceType: null,
                resourceSubTypeIds: data?.resourceSubType.id,
            }
        }
        return {
            resourceType: null,
            resourceSubTypeIds: pnact?.assignedResource.resourceSubType.id,
            resource: pnact?.assignedResource.id,
            notes: pnact?.notes,
            internalNotes: pnact?.internalNotes,
            assignedResourceReturnDate: pnact?.assignedResourceReturnDate ? dayjs(pnact?.assignedResourceReturnDate) : null
        }
    }, [data])

    const validateSelectedEducationalInstitutionContactPersons = () => {
        const a = selectedEducationalInstitutionContactPersons.filter(person => person.jobPosition?.code === 'financially_responsible_person')

        if (a.length > 1) {
            setError('Lūdzu, izvēlēties tikai vienu materiāli atbildīgo personu')
            return false
        }

        setError(null)
        return true
    }

    const onFinish = (values: any) => {
        if (!validateSelectedEducationalInstitutionContactPersons()) return

        if (!isAddForm) {
            editData({
                assignedResourceId: selectedResource?.id,
                assignedResourceReturnDate: values.assignedResourceReturnDate,
                notes: values.notes,
                internalNotes: values.internalNotes,
                educationalInstitutionContactPersonIds: selectedEducationalInstitutionContactPersons.map(person => (person.id))
            }, {id: pnact?.id})
        } else {
            appendData({
                applicationId: applicationId,
                assignedResourceId: values.resource,
                assignedResourceReturnDate: values.assignedResourceReturnDate,
                notes: values.notes,
                internalNotes: values.internalNotes,
                educationalInstitutionContactPersonIds: selectedEducationalInstitutionContactPersons.map(person => (person.id))
            })
        }
    }

    const onReadyClick = async () => {
        await form.validateFields()
        .then(() => {
            const fields = form.getFieldsValue()
            appendDataAsPrepared({
                applicationId: applicationId,
                assignedResourceId: fields.resource,
                assignedResourceReturnDate: fields.assignedResourceReturnDate,
                notes: fields.notes,
                internalNotes: fields.internalNotes,
                educationalInstitutionContactPersonIds: selectedEducationalInstitutionContactPersons.map(person => (person.id))
            })
        })
    }
    
    let searchTimer: any;

    const onSearch = (searchText: string) => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            setFilteredResourceOptions([])
            refetchResources({
                search: searchText,
                resourceStatusIds: RESOURCE_STATUS_AVAILABLE,
                usagePurposeTypeIds: USING_PURPOSE_ISSUED_INDIVIDUALLY,
                targetGroupIds: targetGroups,
                educationalInstitutionIds: [data?.educationalInstitution?.id]
            })
        }, 500)
    }

    const addContactPerson = (personId: string) => {
        const person = educationalInstitutionContactPersons.find(person => person.id === personId) as SelectedEducationalInstitutionContactPerson
        setSelectedEducationalInstitutionContactPersons([
            ...selectedEducationalInstitutionContactPersons,
            {
                id: personId,
                jobPosition: person?.jobPosition,
                name: person?.name,
                email: person?.email,
                phoneNumber: person?.phoneNumber

            }
        ])
        setContactPersonModalIsOpen(false)
    }

    const removeContactPerson = (personId: string) => {
        setSelectedEducationalInstitutionContactPersons(selectedEducationalInstitutionContactPersons.filter(person => person.id !== personId))
    }

    const disabledDate = (current: any) => {
        return current && current < dayjs().endOf('day');
    };

    return (
        <div className="bg-white p-6 rounded-lg">
            <Form
                form={form}
                name="pnact-add"
                onFinish={onFinish}
                layout="vertical"
                initialValues={initialValues}
            >
                {data &&
                    <div className="w-1/3">
                        <div className="stripped-pseudo-table">
                            <div className="grid grid-cols-2 p-2">
                                <div>
                                    Pieteikums
                                </div>
                                <div>{`${data.applicationNumber} (${dayjs(data.applicationDate).format(dateFormat)})`}</div>
                            </div>
                            <div className="grid grid-cols-2 p-2">
                                <div>
                                    P/N akta saskaņotājs
                                </div>
                                {/* <div>{data.conciliator}</div> */}
                            </div>
                            <div className="grid grid-cols-2 p-2">
                                <div>
                                    <b>Resursa lietotājs</b>
                                </div>
                                <div>
                                    {isAddForm ?
                                    <>
                                    <div>
                                        <b>{`${data.resourceTargetPerson.person[0].firstName} ${data.resourceTargetPerson.person[0].lastName} (p.k. ${data.resourceTargetPerson.person[0].privatePersonalIdentifier})`}</b>
                                    </div>
                                    {data?.resourceTargetPersonEducationalStatus?.value}
                                    </>
                                    : 
                                    <>
                                        <div>
                                            <b>{`${data.resourceTargetPerson.persons[0].firstName} ${data.resourceTargetPerson.persons[0].lastName} (p.k. ${data.resourceTargetPerson.persons[0].privatePersonalIdentifier})`}</b>
                                        </div>
                                        {data?.resourceTargetPersonEducationalStatus?.value}
                                    </>
                                    }
                                </div>
                            </div>
                            <div className="grid grid-cols-2 p-2 border-b-2 border-black">
                                <div>
                                    Resursa paveids
                                </div>
                                <div>{data.resourceSubType.value}</div>
                            </div>
                        </div>
                        <Title level={4} className="mt-2">Resurss</Title>
                        {(isAddForm || isChangeResourceModeEnabled) &&
                            <div className="flex gap-4">
                                <Form.Item
                                    name="resourceType"
                                    label="Resursa veids"
                                    className="vertical-label"
                                >
                                    <SearchSelectInput 
                                        options={types.map((item: ClassifierResponse) => ({
                                            label: item.value,
                                            value: item.code,
                                            code: item.code
                                        }))}
                                        className='sm:!w-[200px]'
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="resourceSubTypeIds"
                                    label="Resursa paveids"
                                    className="vertical-label"
                                >
                                    <SearchSelectInput 
                                        options={filteredSubTypes.map((item: ClassifierResponse) => ({
                                            label: item.value,
                                            value: item.id,
                                            code: item.code
                                        }))} 
                                        className='sm:!w-[200px]'
                                    />
                                </Form.Item>
                            </div>
                        }
                        
                            <Row gutter={8} align="bottom">
                                {isChangeResourceModeEnabled ?
                                    <>
                                        <Col flex="auto">
                                            <Form.Item
                                                name="resource"
                                                label="Resursi"
                                                className="vertical-label !mb-0"
                                                rules={[{ required: true, message: "Resursi ir obligāts lauks."}]}
                                            >
                                                <Select 
                                                    options={filteredResourceOptions.map((resource: Resource) => ({
                                                        value: resource.id,
                                                        label: resource.resourceName
                                                    }))}
                                                    filterOption={false}
                                                    showSearch={true}
                                                    notFoundContent={isResourceLoading ? <Spin size="small" /> : undefined }
                                                    onSearch={onSearch}
                                                    onChange={onResourceChange}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col>
                                            <Button
                                                disabled={!resourceSubTypeIds} 
                                                onClick={() => setMoreResourcesModalIsOpen(true)}
                                            >
                                                Vairāk
                                            </Button>
                                            {moreResourcesModalIsOpen && 
                                                <MoreResourcesModal
                                                    handleSelect={(id: string) => form.setFieldValue('resource', id)} 
                                                    setModalOpen={setMoreResourcesModalIsOpen}
                                                    resourceSubType={resourceSubTypeIds}
                                                    selectedSubType={selectedSubType as ClassifierResponse} 
                                                    targetGroups={targetGroups}
                                                    educationalInstitutionId={data?.educationalInstitution.id}
                                                />
                                                    
                                                }
                                        </Col>
                                    </>
                                :
                                    <>
                                        {!isAddForm && <Button onClick={() => setIsChangeResourceModeEnabled(true)}>Izmainīt resursu</Button>}
                                        {isAddForm && 
                                            <>
                                                <Col flex="auto">
                                                    <Form.Item
                                                        name="resource"
                                                        label="Resursi"
                                                        className="vertical-label !mb-0"
                                                        rules={[{ required: true, message: "Resursi ir obligāts lauks."}]}
                                                    >
                                                        <Select 
                                                            options={filteredResourceOptions.map((resource: Resource) => ({
                                                                value: resource.id,
                                                                label: resource.resourceName
                                                            }))}
                                                            filterOption={false}
                                                            showSearch={true}
                                                            notFoundContent={isResourceLoading ? <Spin size="small" /> : undefined }
                                                            onSearch={onSearch}
                                                            onChange={onResourceChange}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col>
                                                    <Button
                                                        disabled={!resourceSubTypeIds} 
                                                        onClick={() => setMoreResourcesModalIsOpen(true)}
                                                    >
                                                        Vairāk
                                                    </Button>
                                                    {moreResourcesModalIsOpen && 
                                                        <MoreResourcesModal
                                                            handleSelect={(id: string) => form.setFieldValue('resource', id)} 
                                                            setModalOpen={setMoreResourcesModalIsOpen}
                                                            resourceSubType={resourceSubTypeIds}
                                                            selectedSubType={selectedSubType as ClassifierResponse} 
                                                            targetGroups={targetGroups}
                                                            educationalInstitutionId={data?.educationalInstitution.id}
                                                        />
                                                            
                                                        }
                                                </Col>
                                                <Col></Col>
                                            </>
                                        }
                                    </>
                                }
                            </Row>
                            {isChangeResourceModeEnabled &&
                                <Button className="mt-2" onClick={setInitialSelectedResource}>Atcelt</Button>
                            }
                        <div className="stripped-pseudo-table mt-4 border">
                            <div className="grid grid-cols-2 p-2">
                                <div>
                                    <b>Resursa dati</b>
                                </div>
                                <div></div>
                            </div>
                            {selectedResource &&
                                <>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            Ražotājs
                                        </div>
                                        <div>{selectedResource.manufacturer?.value}</div>
                                    </div>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            Nosaukums
                                        </div>
                                        <div>{selectedResource.resourceName}</div>
                                    </div>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            Modelis
                                        </div>
                                        <div>{selectedResource.modelName?.value}</div>
                                    </div>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            s.n.
                                        </div>
                                        <div>{selectedResource.serialNumber}</div>
                                    </div>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            Inventāra Nr.
                                        </div>
                                        <div>{selectedResource.inventoryNumber}</div>
                                    </div>
                                    <div className="grid grid-cols-2 p-2">
                                        <div>
                                            <b>Vērtība(ar PVN)</b>
                                        </div>
                                        <div>{`${selectedResource.acquisitionsValue} eiro`}</div>
                                    </div>
                                </>
                            }
                        </div>
                        <Title level={4} className="mt-2">Kontaktpersonas</Title>
                        <div className="stripped-pseudo-table mt-4 border">
                            {selectedEducationalInstitutionContactPersons && selectedEducationalInstitutionContactPersons.length > 0 &&
                                selectedEducationalInstitutionContactPersons.map(person => (
                                    <div key={person.id} className="grid grid-cols-2 p-2 items-center">
                                        <div>
                                            <b>{person.jobPosition?.value}</b>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p>{person.name}</p>
                                                <p>{`${person.phoneNumber}; ${person.email}`}</p>
                                            </div>
                                            <div>
                                            <Button type="primary" shape="circle" onClick={() => removeContactPerson(person.id)}>
                                                -
                                            </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className="p-2 flex justify-center">
                                <Button type="primary" shape="circle" onClick={() => setContactPersonModalIsOpen(true)}>
                                    +
                                </Button>
                                {contactPersonModalIsOpen &&
                                    <ContactPersonModal 
                                        setModalOpen={setContactPersonModalIsOpen}
                                        options={educationalInstitutionContactPersons.map(person => ({
                                            label: person.name,
                                            value: person.id
                                        }))}
                                        submit={addContactPerson}
                                        usedIds={[
                                            ...selectedEducationalInstitutionContactPersons.map(p => p.id),
                                            ...educationalInstitutionContactPersons.filter(p => {
                                                if (p?.jobPosition?.code !== "ict_contact") return false
                                                if (p?.contactPersonResourceSubTypes) {
                                                    // @ts-ignore
                                                    if (p?.contactPersonResourceSubTypes.some(p => p.resourceSubType.id === form.getFieldValue('resourceSubTypeIds'))) {
                                                        return false
                                                    } else {
                                                        return true
                                                    }
                                                }

                                                return false
                                            }).map(p => p.id)
                                        ]}
                                    />
                                }
                            </div>
                        </div>
                        {error && <p className="text-red">{error}</p>}
                        <Form.Item
                            name="notes"
                            label="Nododamā resursa apraksts, vizuālie u.c. defekti"
                            className="vertical-label mb-0 mt-2 label-bold"
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="internalNotes"
                            label="Piezīmes"
                            className="vertical-label mb-0 mt-2 label-bold"
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="assignedResourceReturnDate"
                            label="Termiņš"
                            className="label-bold mt-2"
                            rules={[{ required: true, message: "Termiņš ir obligāts lauks."}]}
                        >
                            <DatePicker format={datePickerFormat} placeholder="Termiņš" disabledDate={disabledDate}/>
                        </Form.Item>
                        {isAddForm ?
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <Button type="primary" htmlType="submit">Saglabāt</Button>
                                    <Button onClick={() => onReadyClick()}>Gatavs izsniegšanai</Button>
                                </div>
                                <LinkButton href='/admin/pnakti'>Atcelt</LinkButton>
                            </div>
                        :
                            <div className="flex justify-between">
                                <Button type="primary" htmlType="submit">Saglabāt</Button>
                            </div>
                        }
                    </div>
                }
            </Form>
        </div>
    )
}

export default PnAct