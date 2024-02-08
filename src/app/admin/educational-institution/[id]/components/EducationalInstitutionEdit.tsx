'use client'

import SearchSelectInput from "@/app/components/searchSelectInput";
import { Button, Checkbox, Form, Input, Table, Tabs, TabsProps, Typography } from "antd";
import ContactPersonsTab from "./Tabs/ContactPersonsTab";
import MainDataTab from "./Tabs/MainDataTab";
import ResourcesTab from "./Tabs/ResourcesTab";
import { startTransition, useState } from "react";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { goToUrl } from "@/app/utils/utils";
import { useRouter } from "next/navigation";
import { EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE, EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT, EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST, EDUCATIONAL_INSTITUTION_STATUS_ACTIVE, EDUCATIONAL_INSTITUTION_STATUS_DISABLED } from "@/app/admin/application/new/components/applicantConstants";
import { EducationalInstitution } from "@/app/types/EducationalInstitution";
import Link from "next/link";
import { useForm } from "antd/es/form/Form";
import LinkButton from "@/app/components/LinkButton";
const { Title } = Typography

export type Person = {
    id: string,
    name: string;
    jobPosition: {
        id: string,
        code: string,
        value: string
    } | string;
    phoneNumber?: string;
    email?: string;
    contactPersonResourceSubTypes?: {
        id: string | null
        resourceSubType: {
            id: string,
            code: string,
            value: string
        }
    }[]
    address: string | null;
}

type EducationalInstitutionEditProps = {
    data: EducationalInstitution
}

const EducationalInstitutionEdit = ({data}: EducationalInstitutionEditProps) => {
    const getEducationalInstitutionPersons = (type: string): Person[] => {
        // @ts-ignore
        return data.educationalInstitutionContactPersons.filter(person => person.jobPosition.id === type)
    }

    const [pnaPersons, setPnaPersons] = useState<Person[]>(getEducationalInstitutionPersons(EDUCATIONAL_INSTITUTION_JOB_POSITION_FINANCE))
    const [specialistsPersons, setSpecialistsPersons] = useState<Person[]>(getEducationalInstitutionPersons(EDUCATIONAL_INSTITUTION_JOB_POSITION_SPECIALIST))
    const [iktPersons, setIktPersons] = useState<Person[]>(getEducationalInstitutionPersons(EDUCATIONAL_INSTITUTION_JOB_POSITION_ICT))
    const [resourceSubTypes, setResourceSubTypes] = useState<EducationalInstitution['educationalInstitutionResourceSubTypes']>(data?.educationalInstitutionResourceSubTypes.map(item => ({
        id: item.id,
        targetPersonGroupTypeId: item.targetPersonGroupType?.id,
        resourceSubTypeId: item.resourceSubType?.id,
        isActive: true
    })))

    const router = useRouter()
    const [form] = useForm()

    const tabs: TabsProps['items'] = [
        {
            key: 'basicData',
            label: 'Pamatdati',
            children: <MainDataTab form={form}/>
        },
        {
            key: 'personContact',
            label: 'Kontaktpersonas',
            children: <ContactPersonsTab 
                pnaPersons={pnaPersons}
                setPnaPersons={setPnaPersons}
                specialistsPersons={specialistsPersons}
                setSpecialistsPersons={setSpecialistsPersons}
                iktPersons={iktPersons}
                setIktPersons={setIktPersons}
            />
        },
        {
            key: 'resourceManagement',
            label: 'Resursu pārvaldība',
            children: <ResourcesTab resourceSubTypes={resourceSubTypes} setResourceSubTypes={setResourceSubTypes}/>
        },
    ]


    const initialValues = {
        ...data,
        status: data.status.id === EDUCATIONAL_INSTITUTION_STATUS_ACTIVE ? true : false
    }

    const {
        appendData
      } = useQueryApiClient({
        request: {
          url: `/EducationalInstitutions/${data.id}`,
          method: 'PUT',
          data: {},
          disableOnMount: true
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
                goToUrl('/admin/educational-institutions', router)
            })
        }
    });

    const parsePersonsForSubmit = () => {
        const parsedPnaPersons = pnaPersons.map(person => (
            data.educationalInstitutionContactPersons.some(p => p.id === person.id) 
            ? {...person, jobPositionId: typeof person.jobPosition === 'string' ? person.jobPosition : person.jobPosition.id }
            : {...person, jobPositionId: typeof person.jobPosition === 'string' ? person.jobPosition : person.jobPosition.id, id: null} 
            ))
        const parsedSpecialistPersons = specialistsPersons.map(person => (
            data.educationalInstitutionContactPersons.some(p => p.id === person.id) 
            ? {...person, jobPositionId: typeof person.jobPosition === 'string' ? person.jobPosition : person.jobPosition.id}
            : {...person, jobPositionId: typeof person.jobPosition === 'string' ? person.jobPosition : person.jobPosition.id, id: null}
        ))
        const parsedIktPersons = iktPersons.map(person => (
            data.educationalInstitutionContactPersons.some(p => p.id === person.id) 
            ? {
                ...person, 
                jobPositionId: typeof person.jobPosition === 'string' 
                    ? person.jobPosition 
                    : person.jobPosition.id,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes 
                    ? person.contactPersonResourceSubTypes.map(subType => ({
                        ...subType,
                        id: subType.id?.startsWith('NEW-SUBTYPE') ? null : subType.id,
                        resourceSubTypeId: subType.resourceSubType.id
                    }))
                    : []
            }
            : {
                ...person, 
                jobPositionId: typeof person.jobPosition === 'string' 
                    ? person.jobPosition 
                    : person.jobPosition.id, 
                id: null,
                contactPersonResourceSubTypes: person.contactPersonResourceSubTypes 
                    ? person.contactPersonResourceSubTypes.map(subType => ({
                        ...subType,
                        id: subType.id?.startsWith('NEW-SUBTYPE') ? null : subType.id,
                        resourceSubTypeId: subType.resourceSubType.id
                    }))
                    : []
            }
        ))

        return [...parsedPnaPersons, ...parsedSpecialistPersons, ...parsedIktPersons]
    }
    const onFinish = (values: any) => {
        appendData({
            name: data.name,
            code: data.code,
            address: values.address,
            city: values.city,
            district: values.district,
            municipality: values.municipality,
            village: values.village,
            supervisorId: data.supervisor.id,
            phoneNumber: values.phoneNumber,
            email: values.email,
            statusId: values.status ? EDUCATIONAL_INSTITUTION_STATUS_ACTIVE : EDUCATIONAL_INSTITUTION_STATUS_DISABLED,
            educationalInstitutionContactPersons: parsePersonsForSubmit(),
            educationalInstitutionResourceSubTypes: resourceSubTypes
        })
    }

    return (
        <div className="bg-white rounded p-6 w-[1000px]">
            <Form name="form" layout="vertical" onFinish={onFinish} initialValues={initialValues} form={form}>
                <div className="font-medium text-3xl mb-3">Izglītības iestādes profils</div>
                <div className="flex justify-between items-center border-b p-1">
                    <Title level={4}>{data.name} (reģ. Nr. {data.code})</Title>
                    <div className="flex items-center gap-1">
                        <Form.Item name="status" valuePropName="checked">
                            <Checkbox>Aktīvs</Checkbox>
                        </Form.Item>
                    </div>
                </div>
                <Title 
                    level={4} 
                    onClick={() => goToUrl(`/admin/supervisor/${data.supervisor.id}`, router)}
                    className="cursor-pointer"
                >
                    {data.supervisor.name} (reģ. Nr. {data.supervisor.code})
                </Title>
                <Tabs type="card" items={tabs}></Tabs>
                <div className="flex gap-3">
                    <Button type="primary" htmlType="submit">Saglabāt</Button>
                    <LinkButton href="/admin/educational-institutions">Atcelt</LinkButton>
                </div>
            </Form>
        </div>
    )
}

export default EducationalInstitutionEdit;