import { Button, Form, Input, Row } from "antd"
import { useForm } from "antd/es/form/Form"
import React, { useEffect, useState } from "react"
import { initialValues } from "./SupervisorList"
import { ResourceFilterType } from "@/app/types/Resource"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import SearchSelectInput from "@/app/components/searchSelectInput"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { EducationalInstitution as EducationalInstitutionType, EducationalInstitutionFilter } from "@/app/types/EducationalInstitution"
import { SelectOption } from "@/app/types/Antd"
import { Supervisor, SupervisorListFilter } from "@/app/types/Supervisor"

type SupervisorFiltersProps = {
  activeFilters: SupervisorListFilter,
  filterState: (val: SupervisorListFilter) => void
  refresh: (val: SupervisorListFilter) => void,
}

const SupervisorFilters = ({activeFilters, filterState, refresh}: SupervisorFiltersProps) => {
    const [supervisorOptions, setSupervisorOptions] = useState<SelectOption[]>([])

    const [form] = useForm()

    const {} = useQueryApiClient({
      request: {
        url: '/supervisors',
      },
      onSuccess: (response: Supervisor[]) => {
        setSupervisorOptions(response.map((edu: Supervisor) => ({
          value: edu.id,
          label: edu.name
        })))
      }
    });


    const filterList = [
      {
        name: 'Vadošā iestāde',
        key: 'supervisorIds',
        render: () => ( <Form.Item name="supervisorIds" label="Vadošā iestāde">
          <SearchSelectInput options={supervisorOptions} mode="multiple"/>
        </Form.Item>)
      },
      {
        name: 'Statuss',
        key: 'supervisorIsActive',
        render: () => ( <Form.Item name="supervisorIsActive" label="Statuss">
          <SearchSelectInput options={[
            {
              value: 1,
              label: 'Aktīvs'
            },
            {
              value: 0,
              label: 'Neaktīvs'
            },
          ]}/>
        </Form.Item>)
      },
    ]

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
      const filters: SupervisorListFilter = {
        ...activeFilters,
        ...initialValues,
        supervisorIds: values.supervisorIds,
        supervisorIsActive: values.supervisorIsActive !== undefined ? !!values.supervisorIsActive : null,
      }

      filterState(filters)
      refresh(filters)
    }

    return (
        <Form
            form={form}
            name="supervisorListFilters"
            onFinish={onFinish}
            layout="vertical"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {filterList.map(filter => (
                <React.Fragment key={filter.key}>
                  {filter.render()}
                </React.Fragment>
              ))}
            </div>
            <Form.Item>
            <Row>
                <div className='flex gap-2'>
                    <Button type="primary" htmlType="submit">
                        Atlasīt
                    </Button>
                    <Button htmlType="button" onClick={onReset}>
                        Atcelt
                    </Button>
                </div>
            </Row>
        </Form.Item>
      </Form>
    )
}

export default SupervisorFilters