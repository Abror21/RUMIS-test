import SearchSelectInput from "@/app/components/searchSelectInput"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Button, Form, Input, Select } from "antd"
import { useForm } from "antd/es/form/Form"
import { ResourcesFilterType, initialValues } from "./MoreResourcesModal"

type MoreResourcesFiltersProps = {
    activeFilters: ResourcesFilterType,
    filterState: (val: ResourcesFilterType) => void
    refresh: (val: ResourcesFilterType) => void,
}

const MoreResourcesFilters = ({activeFilters, filterState, refresh}: MoreResourcesFiltersProps) => {
    const [form] = useForm()

    const {
        data: resourceModelOptions
      } = useQueryApiClient({
        request: {
          url: `/classifiers`,
          data: {
            type: 'resource_model_name',
            includeDisabled: false
          }

        },
    });
    
    const {
        data: manufacterOptions
      } = useQueryApiClient({
        request: {
          url: `/classifiers`,
          data: {
            type: 'resource_manufacturer',
            includeDisabled: false
          }

        },
    });
    
    const onReset = () => {
        form.resetFields()
    
        filterState(initialValues)
        refresh(initialValues)
    }
    
    const onFinish = (values: any) => {
        const filters: ResourcesFilterType = {
            ...activeFilters,
            inventoryNumber: values.inventoryNumber,
            modelIdentifier: values.modelIdentifier,
            manufacturerIds: values.manufacturerIds,
            serialNumber: values.serialNumber,
            resourceName: values.resourceName,
          }

          filterState(filters)
          refresh(filters)
    }
    return (
        <Form
            form={form}
            name="persons"
            onFinish={onFinish}
            layout="vertical"
            className="!mb-2"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Form.Item name="inventoryNumber" label="Inventāra Nr.">
                    <Input />
                </Form.Item>
                <Form.Item name="modelIdentifier" label="Modelis">
                  
                  <Select options={resourceModelOptions.map((option: any) => ({
                    value: option.id,
                    label: option.value
                  }))}/>
                </Form.Item>
                <Form.Item name="manufacturerIds" label="Ražotājs">
                  <Select options={manufacterOptions.map((option: any) => ({
                    value: option.id,
                    label: option.value
                  }))}/>
                </Form.Item>
                <Form.Item name="serialNumber" label="Sērijas Nr.">
                    <Input />
                </Form.Item>
                <Form.Item name="resourceName" label="Resursa nosaukums (iestādes)">
                    <Input />
                </Form.Item>
            </div>
            <div className='flex gap-2'>
                <Button type="primary" htmlType="submit">
                    Atlasīt
                </Button>
                <Button htmlType="button" onClick={onReset}>
                    Notīrīt
                </Button>
            </div>
        </Form>
    )
}

export default MoreResourcesFilters