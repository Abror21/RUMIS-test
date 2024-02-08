import {Button, DatePicker, Form, Row} from "antd"
import {useForm} from "antd/es/form/Form"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import dayjs from "dayjs"
import {dateFormat, mmDdYyFormat} from "@/app/utils/AppConfig"
import SearchSelectInput from "@/app/components/searchSelectInput"
import React, {useEffect, useState} from "react"
import {Supervisor} from "@/app/types/Supervisor"
import {EducationalInstitution} from "@/app/types/EducationalInstitution"
import { ReportFilters } from "@/app/types/Report"

type ReportsFiltersProps = {
    activeFilters: ReportFilters,
    filterState: (val: ReportFilters) => void,
    refresh: (val: ReportFilters) => void,
    permissionType: string;
    initialFilters: ReportFilters
}

const ReportsFilters = ({activeFilters, filterState, refresh, permissionType, initialFilters}: ReportsFiltersProps) => {
    const [allEducationalInstitution, setAllEducationalInstitution] = useState<EducationalInstitution[]>([])
    const [filteredEducationalInstitution, setFilteredEducationalInstitution] = useState<EducationalInstitution[]>([])

    const [form] = useForm()

    const supervisorId = Form.useWatch('supervisorId', form)
    const educationalInstitutionId = Form.useWatch('educationalInstitutionId', form)
    useEffect(() => {
        if (supervisorId) {
            const filteredValues = allEducationalInstitution.filter(edu => edu.supervisor.id === supervisorId)
            setFilteredEducationalInstitution(filteredValues)

            if (!filteredValues.find(v => v.id === educationalInstitutionId)) {
                form.setFieldValue('educationalInstitutionId', null)
            }
        } else {
            setFilteredEducationalInstitution(allEducationalInstitution)
        }
    }, [supervisorId])

    const {
        data: supervisors
    } = useQueryApiClient({
        request: {
            url: `/supervisors`
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
    
    const onFinish = (values: any) => {
        const filters = {
            date: dayjs(values.date).format(mmDdYyFormat),
            supervisorId: values?.supervisorId,
            educationalInstitutionId: values?.educationalInstitutionId
        }

        filterState(filters)
        refresh(filters)
    }

    const onReset = () => {
        const currentDate = dayjs()

        form.setFieldsValue({
            date: currentDate,
            educationalInstitutionId: initialFilters?.educationalInstitutionId,
            supervisorId: initialFilters?.supervisorId
        });
        const filters = {
            date: currentDate.format(mmDdYyFormat),
            educationalInstitutionId: initialFilters?.educationalInstitutionId,
            supervisorId: initialFilters?.supervisorId
        }

        filterState(filters)
        refresh(filters)
    }
    return (
        <div className="bg-white rounded-lg p-6">
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{...activeFilters, date: dayjs(activeFilters.date)}}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                    <Form.Item label="Datums" name="date">
                        <DatePicker format={dateFormat} allowClear={false} className="w-full"/>
                    </Form.Item>
                    {(permissionType === 'Country' || permissionType === 'Supervisor') && 
                        <Form.Item 
                            label="Vadošā iestāde" 
                            name="supervisorId"
                            rules={[
                                {required: permissionType === 'Supervisor', message: 'Obligāts filtrs'}
                            ]}
                        >
                            <SearchSelectInput
                                placeholder="Izvēlies no saraksta"
                                allowClear
                                options={initialFilters?.supervisorId 
                                    ? supervisors.map((item: Supervisor) => ({
                                        value: item.id,
                                        label: item.name,
                                        rest: item.code
                                    })).filter((s: any) => s.value === initialFilters?.supervisorId)
                                    : supervisors.map((item: Supervisor) => ({
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
                        </Form.Item>
                    }
                    <Form.Item 
                        label="Izglītības iestāde" 
                        name="educationalInstitutionId" 
                        rules={[
                            {required: permissionType === 'EducationalInstitution', message: 'Obligāts filtrs'}
                        ]}
                    >
                        <SearchSelectInput
                            placeholder="Izvēlies no saraksta"
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
                            }}
                        />
                    </Form.Item>
                </div>
                <Row>
                    <div className='flex gap-2'>
                        <Button type="primary" htmlType="submit">
                            Atlasīt
                        </Button>
                        <Button htmlType="button" onClick={() => {
                            onReset()
                        }}>
                            Atcelt
                        </Button>
                    </div>
                </Row>
            </Form>
        </div>
    )
}

export default ReportsFilters