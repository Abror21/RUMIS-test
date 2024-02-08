import { Button, Form, Input, Row } from "antd"
import { useForm } from "antd/es/form/Form"
import {ResourceFilterType, Resource as ResourceType} from "@/app/types/Resource"
import { initialValues } from "./steps/FirstStep"
import SearchSelectInput from "@/app/components/searchSelectInput"
import { ClassifierResponse } from "@/app/types/Classifiers"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { useState } from "react"
import { SelectOption } from "@/app/types/Antd"

type ResourceCopyFiltersProps = {
    activeFilters: ResourceFilterType,
    filterState: (val: ResourceFilterType) => void
    refresh: (val: ResourceFilterType) => void,
    resource: ResourceType | null
}

const ResourceCopyFilters = ({activeFilters, filterState, refresh, resource}: ResourceCopyFiltersProps) => {
    const [form] = useForm()

    const [modelOptions, setModelOptions] = useState<SelectOption[]>([])
    const [resourceUsingPurposeOptions, setResourceUsingPurposeOptions] = useState<SelectOption[]>([])
    const [resourceStatusOptions, setResourceStatusOptions] = useState<SelectOption[]>([])
    const [targetGroupOptions, setTargetGroupOptions] = useState<SelectOption[]>([])

    useQueryApiClient({
        request: {
            url: '/classifiers/getByType',
            data: {
                types: [
                    'resource_model_name',
                    'resource_using_purpose',
                    'resource_status',
                    'target_group'
                ],
                includeDisabled: false
            },
        },
        onSuccess: (response: ClassifierResponse[]) => {
            const newModelOptions: SelectOption[] = []
            const newResourceUsingPurposeOptions: SelectOption[] = []
            const newResourceStatusOptions: SelectOption[] = []
            const newTargetGroupOptions: SelectOption[] = []

            response.map(option => {
                if (option.type === "resource_using_purpose") {
                    newResourceUsingPurposeOptions.push({
                        value: option.id,
                        label: option.value
                    })
                }
                if (option.type === "resource_model_name") {
                    newModelOptions.push({
                        value: option.id,
                        label: option.value
                    })
                }
                if (option.type === "resource_status") {
                    newResourceStatusOptions.push({
                        value: option.id,
                        label: option.value
                    })
                }
                if (option.type === "target_group") {
                    newTargetGroupOptions.push({
                        value: option.id,
                        label: option.value
                    })
                }
            })

            setModelOptions(newModelOptions)
            setResourceUsingPurposeOptions(newResourceUsingPurposeOptions)
            setResourceStatusOptions(newResourceStatusOptions)
            setTargetGroupOptions(newTargetGroupOptions)
        }
    })


    const onReset = () => {
        form.resetFields()

        filterState({
            ...initialValues,
            take: activeFilters.take,
        })
        refresh({
            ...initialValues,
            take: activeFilters.take,
        })
    }

    const onFinish = (values: any) => {
        const filters: ResourceFilterType = {
            ...activeFilters,
            ...initialValues,
            resourceName: values.resourceName,
            modelNameIds: values.modelNameIds,
            resourceStatusIds: values.resourceStatusIds,
            usagePurposeTypeIds: values.usagePurposeTypeIds,
            targetGroupIds: values.targetGroupIds,
        }

        filterState(filters)
        refresh(filters)
    }
    return (
        <div className="mb-2">
            <Form
                form={form}
                name="resourcsFilters"
                onFinish={onFinish}
                layout="vertical"
            >
                <div className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                           <b>Ražotājs</b>
                           <p>{resource?.manufacturer?.code}</p> 
                        </div>
                        <Form.Item name="modelNameIds" label="Modelis">
                            <SearchSelectInput 
                                placeholder="Asus Chromebook Flip CX3 CX3400FMA-EC0226 1"
                                options={modelOptions}
                                mode="multiple"
                            />
                        </Form.Item>
                        <Form.Item name="usagePurposeTypeIds" label="Izmantošanas mērķis">
                            <SearchSelectInput 
                                placeholder="Izvēlies no saraksta"
                                options={resourceUsingPurposeOptions}
                                mode="multiple"
                            />
                        </Form.Item>
                        <Form.Item name="resourceStatusIds" label="Resursa statuss">
                            <SearchSelectInput 
                                placeholder="Izvēlies no saraksta"
                                options={resourceStatusOptions}
                                mode="multiple"
                            />
                        </Form.Item>
                        <div>
                           <b>Resursa nosaukums</b>
                           <p>{resource?.resourceName}</p> 
                        </div>
                        <Form.Item name="resourceNumber" label="Resursa kods">
                            <Input placeholder="JVSK-LEN0068"/>
                        </Form.Item>
                        <Form.Item name="targetGroupIds" label="Mērķa grupa">
                            <SearchSelectInput 
                                placeholder="Izvēlies no saraksta"
                                options={targetGroupOptions}
                                mode="multiple"
                            />
                        </Form.Item>
                        <Form.Item name="resourceName" label="Resursa nosaukums(iestādes)">
                            <Input placeholder="Chromebook dators"/>
                        </Form.Item>
                    </div>
                        <Row style={{marginBottom: 0}}>
                            <div className='flex gap-2'>
                                <Button type="primary" htmlType="submit">
                                    Atlasīt
                                </Button>
                                <Button htmlType="button" onClick={onReset}>
                                    Notīrīt
                                </Button>
                            </div>
                        </Row>
                </div>
            </Form>
        </div>
    )
}

export default ResourceCopyFilters