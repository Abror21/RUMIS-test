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

type CancelPnaModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    id: string
}

const CancelPnaModal = ({id, setModalOpen}: CancelPnaModalProps) => {
    const [cancellingReasonOptions, setCancellingReasonOptions] = useState<SelectOption[]>([])

    const [form] = useForm()
    const router = useRouter();

    const onFinish = (values: any) => {
        cancelRequest({
            reasonId: values.reasonId,
            description: values.description,
            changeApplicationStatusToWithdrawn: values.changeApplicationStatusToWithdrawn,
        })
    }

    const {} = useQueryApiClient({
        request: {
            url: '/classifiers',
            data: {
                type: 'pna_canceling_reason',
                includeDisabled: false
            }
        },
        onSuccess: (response: ClassifierResponse[]) => {
            setCancellingReasonOptions(response.map(option =>  ({
                value: option.id,
                label: option.value
            })))
        }
    })

    const {
        appendData: cancelRequest,
        isLoading
    } = useQueryApiClient({
        request: {
            url: `/applicationResources/${id}/cancel`,
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
            title="Izsniegšanas atcelšana"
        >
            <Spin spinning={isLoading}>
                <Form
                    form={form}
                    name="cancel-pna"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="reasonId"
                        label="Resursa nodošanas atcelšanas iemesls"
                        rules={[{required: true, message:"Lauks ir obligāts lauks"}]}
                    >
                        <Select 
                            options={cancellingReasonOptions}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="description" 
                        label="Piezīmes"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="changeApplicationStatusToWithdrawn" valuePropName="checked">
                        <Checkbox>Piešķirt pieteikumam statusu Atsaukts.</Checkbox>
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

export default CancelPnaModal