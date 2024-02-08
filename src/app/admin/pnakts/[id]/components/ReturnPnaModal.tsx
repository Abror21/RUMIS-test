import { PNA_STATUS_LOST, PNA_STATUS_STOLEN, RESOURCE_STATUS_AVAILABLE, RESOURCE_STATUS_DAMAGED, RESOURCE_STATUS_MAINTENANCE } from "@/app/admin/application/new/components/applicantConstants"
import { SelectOption } from "@/app/types/Antd"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { datePickerFormat, dateRequestFormat } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { UploadOutlined } from "@ant-design/icons"
import { Button, Checkbox, DatePicker, Form, Input, Modal, Select, Spin, Upload, UploadFile } from "antd"
import { useForm } from "antd/es/form/Form"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useMemo, useState } from "react"

const { TextArea } = Input;

type ReturnPnaModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    id: string
}

const ReturnPnaModal = ({id, setModalOpen}: ReturnPnaModalProps) => {
    const [returnResourceStateOptions, setReturnResourceStateOptions] = useState<SelectOption[]>([])

    const [form] = useForm()
    const router = useRouter();

    const onFinish = (values: any) => {
        const returnResourceDate = values.returnResourceDate['$d']

        returnRequest({
            resourceStatusId: values.resourceStatusId,
            returnResourceStateId: values.returnResourceStateId,
            returnResourceDate: dayjs(returnResourceDate).format(dateRequestFormat),
            notes: values.notes,
        })
    }

    const {} = useQueryApiClient({
        request: {
            url: '/classifiers',
            data: {
                type: 'resource_return_status',
                includeDisabled: false
            }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            setReturnResourceStateOptions(response.map(option =>  ({
                value: option.id,
                label: option.value
            })))
        }
    })

    const {
        appendData: returnRequest,
        isLoading: isStolenRequestLoading
    } = useQueryApiClient({
        request: {
            url: `/applicationResources/${id}/return`,
            method: 'PUT',
        },
        onSuccess: (response: any) => {
            setModalOpen(false)
            router.refresh()
        }
    })

    return (
        <Modal
            open={true}
            onCancel={() => setModalOpen(false)}
            footer={false}
            title="Zādzības vai nozaudēšanas datu ievade"
        >
            <Spin spinning={isStolenRequestLoading}>
                <Form
                    form={form}
                    name="change-term"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="returnResourceStateId"
                        label="Resursa atriešanas statuss"
                        rules={[{required: true, message:"Resursa atriešanas statuss ir obligāts lauks"}]}
                    >
                        <Select 
                            options={returnResourceStateOptions}
                        />
                    </Form.Item>
                    <div className="flex gap-2">
                        <Form.Item
                            name="resourceStatusId"
                            label="Resursa statuss"
                            rules={[{required: true, message:"Resursa statuss ir obligāts lauks"}]}
                            className="w-full"
                        >
                            <Select 
                                options={[
                                    {
                                        value: RESOURCE_STATUS_AVAILABLE,
                                        label: 'Pieejams izsniegšanai'
                                    },
                                    {
                                        value: RESOURCE_STATUS_MAINTENANCE,
                                        label: 'Apkopē'
                                    },
                                    {
                                        value: RESOURCE_STATUS_DAMAGED,
                                        label: 'Bojāts'
                                    },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="returnResourceDate"
                            label="Atgriešanas datums"
                            rules={[{required: true, message:"Atgriešanas datums ir obligāts lauks"}]}
                            className="w-full"
                        >
                            <DatePicker format={datePickerFormat} className="w-full" />
                        </Form.Item>
                    </div>
                    <Form.Item 
                        name="notes" 
                        label="Piezīmes"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <div className="flex justify-center gap-2">
                        <Button type="default" onClick={() => setModalOpen(false)}>Atcelt</Button>
                        <Button type="primary" htmlType="submit">Saglabāt</Button>
                    </div>
                </Form>
            </Spin>
        </Modal>
    )
}

export default ReturnPnaModal