'use client'

import SearchSelectInput from "@/app/components/searchSelectInput"
import { Button, Form, Tabs, Tag, Typography } from "antd"
import { Person } from "../EducationalInstitutionEdit"
import { Dispatch, SetStateAction, useState } from "react"
import AddEditViewPersonModal from "../Modals/AddEditViewPersonModal"
import { EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE, EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT, EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST } from "@/app/admin/application/new/components/applicantConstants"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { SelectOption } from "@/app/types/Antd"

const { Title } = Typography

type ContactPersonsTabProps = {
    pnaPersons: Person[];
    setPnaPersons: Dispatch<SetStateAction<Person[]>>
    specialistsPersons: Person[];
    setSpecialistsPersons: Dispatch<SetStateAction<Person[]>>
    iktPersons: Person[];
    setIktPersons: Dispatch<SetStateAction<Person[]>>
}

type EducationalInstitutionStatuses = '3e52f13f-5acb-4ac5-968c-ed9ee134250b' | '44257708-3158-48c6-be92-cb3781985fa7' | 'c92506f8-036d-4d9d-9efe-7b607f6fac5b' | null

const ContactPersonsTab = ({pnaPersons, setPnaPersons, specialistsPersons, setSpecialistsPersons, iktPersons, setIktPersons}: ContactPersonsTabProps) => {
    const [addEditViewModalIsOpen, setAddEditViewModalIsOpen] = useState<boolean>(false)
    const [addEditViewModalMode, setAddEditViewModalMode] = useState<'ADD' | 'EDIT' | 'VIEW' | null>(null)
    const [jobPosition, setJobPosition] = useState<EducationalInstitutionStatuses>(null)
    const [currentPerson, setCurrentPerson] = useState<any>(null)

    const [subTypes, setSubTypes] = useState<SelectOption[]>([])

    const {} = useQueryApiClient({
        request: {
            url: `/classifiers`,
            data: {
                type: 'resource_subtype',
                includeDisabled: false
            }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            setSubTypes(response.map((classifier) => ({
                value: classifier.id,
                label: classifier.value
            })))
        }
    })

    const openAddModal = (jobPosition: EducationalInstitutionStatuses) => {
        setAddEditViewModalIsOpen(true)
        setAddEditViewModalMode('ADD')
        setJobPosition(jobPosition)
    }

    const openViewModal = (person: any, jobPosition: EducationalInstitutionStatuses, modalMode: 'VIEW' | 'EDIT') => {
        setAddEditViewModalIsOpen(true)
        setAddEditViewModalMode(modalMode)
        setJobPosition(jobPosition)
        setCurrentPerson(person)
    }

    const addPnaPerson = (values: any) => {
        setPnaPersons([
            ...pnaPersons,
            {
                id: String(Date.now()),
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE,
                address: values.address
            }
        ])
    }

    const editPnaPerson = (values: any) => {
        setPnaPersons(pnaPersons.map(person => (
            person.id === currentPerson.id ? 
            {
                id: person.id,
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE,
                address: values.address
            } : person
        )))
    }

    const addSpecialistPerson = (values: any) => {
        setSpecialistsPersons([
            ...specialistsPersons,
            {
                id: String(Date.now()),
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST,
                address: values.address
            }
        ])
    }

    const editSpecialistPerson = (values: any) => {
        setIktPersons(iktPersons.map(person => (
            person.id === currentPerson.id ? 
            {
                id: person.id,
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST,
                address: values.address
            } : person
        )))
    }

    const addIktPerson = (values: any) => {
        setIktPersons([
            ...iktPersons,
            {
                id: String(Date.now()),
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT,
                address: values.address,
                contactPersonResourceSubTypes: []
            }
        ])
    }

    const editIktPerson = (values: any) => {
        setIktPersons(iktPersons.map(person => (
            person.id === currentPerson.id ? 
            {
                id: person.id,
                name: values.name,
                email: values.email,
                phoneNumber: values.phoneNumber,
                jobPosition: EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT,
                address: values.address,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes
            } : person
        )))
    }


    const closeModal = () => {
        setAddEditViewModalIsOpen(false)
        setAddEditViewModalMode(null)
        setJobPosition(null)
        setCurrentPerson(null)
    }

    const onSubmit = (values: any) => {
        if (addEditViewModalMode === 'ADD' && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE) {
            addPnaPerson(values)
        }
        if ((addEditViewModalMode === 'EDIT' || addEditViewModalMode === 'VIEW') && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE) {
            editPnaPerson(values)
        }
        if (addEditViewModalMode === 'ADD' && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST) {
            addSpecialistPerson(values)
        }
        if ((addEditViewModalMode === 'EDIT' || addEditViewModalMode === 'VIEW') && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST) {
            editSpecialistPerson(values)
        }
        if (addEditViewModalMode === 'ADD' && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT) {
            addIktPerson(values)
        }
        if ((addEditViewModalMode === 'EDIT' || addEditViewModalMode === 'VIEW') && jobPosition === EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT) {
            editIktPerson(values)
        }
    }

    const addResourceSubType = (value: string, select: SelectOption, iktPerson: Person) => {
        if (iktPerson.contactPersonResourceSubTypes?.some((subType) => subType.resourceSubType.id === value)) return

        setIktPersons(iktPersons.map(person => (
            person.id === iktPerson.id ? 
            {
                ...person,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes? [
                    ...person.contactPersonResourceSubTypes,
                    {
                        id: 'NEW-SUBTYPE' + String(Date.now()),
                        resourceSubType: {
                            id: value,
                            code: value,
                            value: select.label,
                        }
                    }
                ] : [
                    {
                        id: 'NEW-SUBTYPE' +String(Date.now()),
                        resourceSubType: {
                            id: value,
                            code: value,
                            value: select.label,
                        }
                    }
                ]
            } : person
        )))
    }

    const removeResourceSubType = (value: string, iktPerson: Person) => {
        setIktPersons(iktPersons.map(person => (
            person.id === iktPerson.id ? 
            {
                ...person,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes 
                ? person.contactPersonResourceSubTypes.filter(subType => subType.resourceSubType.id !== value)
                : []
            } : person
        )))
    }

    return (
        <>
            <div className="mb-4">
                <Title level={4}>Pieņemšanas Nodošanas atbildīgā persona</Title>
                {pnaPersons.map((person, index) => (
                    <div key={`${person.name}-${index}`} className="grid grid-cols-2 gap-2 w-1/2 mb-2">
                        <Button type="link" className="!text-start !p-0" onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE, 'VIEW')}>{person.name}</Button>
                        <Button onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE, 'EDIT')}>labot</Button>
                    </div>
                ))}
                <Button onClick={() => openAddModal(EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE)}>Pievienot</Button>
                {(addEditViewModalIsOpen && addEditViewModalMode) &&
                    <AddEditViewPersonModal 
                        closeModal={closeModal} 
                        initialFormMode={addEditViewModalMode}
                        onSubmit={onSubmit}
                        currentPerson={currentPerson}
                    />
                }
            </div>
            <div className="mb-4">
                <Title level={4}>Personu datu speciālists</Title>
                {specialistsPersons.map((person, index) => (
                    <div key={`${person.name}-${index}`} className="grid grid-cols-2 gap-2 w-1/2 mb-2">
                        <Button type="link" className="!text-start !p-0" onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST, 'VIEW')}>{person.name}</Button>
                        <Button onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST, 'EDIT')}>labot</Button>
                    </div>
                ))}
                {specialistsPersons.length === 0 &&
                    <Button onClick={() => openAddModal(EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST)}>Pievienot</Button>
                }
            </div>
            <div className="mb-4">
                <Title level={4}>IKT kontaktpersona</Title>
                {iktPersons.map((person, index) => (
                    <div key={`${person.name}-${index}`} className="grid grid-cols-4 gap-2 mb-2">
                        <Button type="link" className="!text-start !p-0" onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT, 'VIEW')}>{person.name}</Button>
                        <Button onClick={() => openViewModal(person, EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT, 'EDIT')}>labot</Button>
                        <div className="flex flex-wrap gap-1">
                            {person.contactPersonResourceSubTypes && 
                                person.contactPersonResourceSubTypes.map(subType => (
                                    <Tag
                                        key={subType.resourceSubType.id}
                                        closable={true}
                                        style={{ userSelect: 'none' }}
                                        className="!mr-0"
                                        onClose={() => removeResourceSubType(subType.resourceSubType.id, person)}
                                    >
                                        {subType.resourceSubType.value}
                                    </Tag> 
                                ))
                            }
                        </div>
                        <SearchSelectInput 
                            options={subTypes}
                            placeholder="Resursu paveids"
                            // @ts-ignore
                            onChange={(value, ...select: SelectOption[]) => addResourceSubType(value, select[0], person)}
                        />
                    </div>
                ))}
                <Button onClick={() => openAddModal(EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT)}>Pievienot</Button>
            </div>
        </>
    )
}

export default ContactPersonsTab