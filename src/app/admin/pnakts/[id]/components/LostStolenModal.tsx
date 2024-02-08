import { PNA_STATUS_LOST, PNA_STATUS_STOLEN } from "@/app/admin/application/new/components/applicantConstants"
import { datePickerFormat } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { UploadOutlined } from "@ant-design/icons"
import { Button, Checkbox, DatePicker, Form, Input, Modal, Select, Spin, Upload, UploadFile } from "antd"
import { useForm } from "antd/es/form/Form"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useMemo, useState } from "react"

const { TextArea } = Input;

type LostStolenModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    id: string
}

const LostStolenModal = ({id, setModalOpen}: LostStolenModalProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const [form] = useForm()
    const router = useRouter();

    const uploadProps = useMemo(
        () => ({
          beforeUpload: (file: UploadFile) => {
            setFileList((state) => [...state, file]);
            return false;
          },
          onRemove: (file: UploadFile) => {
            if (fileList.some((item) => item.uid === file.uid)) {
              setFileList((fileListItems) =>
                fileListItems.filter((item) => item.uid !== file.uid),
              );
              form.setFieldValue('files', undefined)
              return false;
            }
            return false;
          },
          maxCount: 1,
          fileList: fileList
        }),
        [fileList],
    );
    
    const onFinish = (values: any) => {
        const formData = new FormData()
        formData.append('notes', values.notes);
        formData.append('files', values.files?.file);

        if (values.type === PNA_STATUS_STOLEN) {
            stolenRequest(formData)
            // stolenRequest({
            //     notes: values.notes,
            //     files: values.files
            // })
        } else {
            lostRequest(formData)
        }
    }

    const {
        appendData: stolenRequest,
        isLoading: isStolenRequestLoading
    } = useQueryApiClient({
        request: {
            url: `/applicationResources/${id}/stolen`,
            method: 'PUT',
            multipart: true
        },
        onSuccess: (response: any) => {
            setModalOpen(false)
            router.refresh()
        }
    })

    const {
        appendData: lostRequest,
        isLoading: isLostRequestLoading
    } = useQueryApiClient({
        request: {
            url: `/applicationResources/${id}/lost`,
            method: 'PUT',
            multipart: true
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
            <Spin spinning={isStolenRequestLoading || isLostRequestLoading}>
                <Form
                    form={form}
                    name="change-term"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="type"
                        label="Resurss tika"
                        rules={[{required: true, message:"Lūdzu izvēlieties tipu"}]}
                    >
                        <Select 
                            options={[
                                {
                                    value: PNA_STATUS_STOLEN,
                                    label: 'Nozagts'
                                },
                                {
                                    value: PNA_STATUS_LOST,
                                    label: 'Nozaudēts'
                                },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="notes" 
                        label="Notikušā apstākļu apraksts"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item 
                        name="files" 
                        extra="Augšupielādāt var .pdf, .jpg formāta datni. Maksimālais izmērs 2MB."
                    >
                        <Upload {...uploadProps} accept=".pdf, .jpg, .jpeg">
                            <Button icon={<UploadOutlined />}>Pievienot datni</Button>
                        </Upload>
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

export default LostStolenModal