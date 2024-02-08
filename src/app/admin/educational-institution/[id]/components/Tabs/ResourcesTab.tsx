'use client'

import SearchSelectInput from "@/app/components/searchSelectInput"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { EducationalInstitution } from "@/app/types/EducationalInstitution"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Checkbox, Collapse, Form, Table } from "antd"
import { Dispatch, SetStateAction, useState } from "react"

type ResourcesTabProps = {
    resourceSubTypes: EducationalInstitution['educationalInstitutionResourceSubTypes'],
    setResourceSubTypes: Dispatch<SetStateAction<EducationalInstitution['educationalInstitutionResourceSubTypes']>>
}

const ResourcesTab = ({resourceSubTypes, setResourceSubTypes}: ResourcesTabProps) => {
    const [typeOptions, setTypeOptions] = useState<ClassifierResponse[]>([])
    const [subTypeOptions, setSubTypeOptions] = useState<ClassifierResponse[]>([])
    const [targetGroupOptions, setTargetGroupOptions] = useState<ClassifierResponse[]>([])

    const {} = useQueryApiClient({
        request: {
            url: `/classifiers/getbytype`,
            data: {
                types: ['resource_type', 'resource_subtype', 'target_group'],
                includeDisabled: false
            }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            const newTypeOptions: ClassifierResponse[] = []
            const newSubTypeOptions: ClassifierResponse[] = []
            const newTargetGroupOptions: ClassifierResponse[] = []

            response.forEach(item => {
                if (item.type === 'resource_type') {
                    newTypeOptions.push({
                        ...item,
                        // @ts-ignore
                        payload: item.payload ? JSON.parse(item.payload) : null
                    })
                }
                if (item.type === 'resource_subtype') {
                    newSubTypeOptions.push({
                        ...item,
                        // @ts-ignore
                        payload: item.payload ? JSON.parse(item.payload) : null
                    })
                }
                if (item.type === 'target_group') {
                    newTargetGroupOptions.push({
                        ...item,
                        // @ts-ignore
                        payload: item.payload ? JSON.parse(item.payload) : null
                    })
                }
            })

            setTypeOptions(newTypeOptions)
            setSubTypeOptions(newSubTypeOptions)
            setTargetGroupOptions(newTargetGroupOptions)
        }
    });

    const handleActiveChange = (bool: boolean, id: string) => {
        if (resourceSubTypes.some(i => i.resourceSubTypeId === id)) {
            if (bool) {
                setResourceSubTypes(resourceSubTypes.map(item => (
                    item.resourceSubTypeId === id ? {
                        ...item,
                        isActive: bool
                    } : item
                )))
            } else {
                setResourceSubTypes(resourceSubTypes.filter(item => item.resourceSubTypeId !== id))
            }
        } else {
            setResourceSubTypes([
                ...resourceSubTypes,
                {
                    id: null,
                    resourceSubTypeId: id,
                    targetPersonGroupTypeId: null,
                    isActive: bool
                }
            ])
        }
    }

    const handleTargetGroupChange = (value: string, id: string) => {
            setResourceSubTypes(resourceSubTypes.map(item => (
                item.resourceSubTypeId === id ? {
                    ...item,
                    targetPersonGroupTypeId: value
                } : item
            )))
    }

    const columns = [
        {
          key: 'value',
          dataIndex: "value",
          title: "Nosaukums",
        },
        {
          key: 'targetPersonGroupTypeId',
          dataIndex: "targetPersonGroupTypeId",
          title: "Var pieteikties",
          render: (targetPersonGroupTypeId: string, record: any) => (
            <div className="w-full">
                <SearchSelectInput 
                    className="w-full" 
                    options={targetGroupOptions.map(option => ({
                        value: option.id,
                        label: option.value
                    }))}
                    disabled={!resourceSubTypes.find(t => t.resourceSubTypeId === record?.id)}
                    onChange={(value) => handleTargetGroupChange(value, record.id)}
                    value={resourceSubTypes.find(t => t.resourceSubTypeId === record?.id)?.targetPersonGroupTypeId}
                />
            </div>
          ),
        },
        {
          key: 'isActive',
          dataIndex: "isActive",
          title: "Aktīvs",
          render: (isActive: boolean, record: any) => (
            <Checkbox checked={!!resourceSubTypes.find(t => t.resourceSubTypeId === record?.id)?.isActive} onChange={(e) => handleActiveChange(e.target.checked, record.id)}/>
          )
        },
    ]

    const items = typeOptions.map(option => (
        {
            key: option.id,
            label: option.value,
            // @ts-ignore
            children: <Table columns={columns} dataSource={subTypeOptions.filter(o => o.payload.resource_type === option.code)} pagination={false}/>
        }
    ))
    return (
        <Collapse accordion items={items} className="mb-2"/>
    )
}

export default ResourcesTab