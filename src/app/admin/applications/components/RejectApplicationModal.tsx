import { Button, Checkbox, Form, Input, Modal, Spin, Typography } from "antd"
import { Dispatch, SetStateAction, useState } from "react"

type RejectApplicationModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    ids: string[]
    isLoading: boolean
    submitAction: Function
}

const { TextArea } = Input;

const RejectApplicationModal = ({setModalOpen, ids, isLoading, submitAction}: RejectApplicationModalProps) => {
    const [form] = Form.useForm();

    const rejectReasonTitle = ids.length === 1 ? 'Lūdzu norādīt resursa pieteikuma atteikšanas iemeslu' : `Lūdzu norādīt ${ids.length} resursa pieteikumu atteikšanas iemeslu:`
    
    const checkboxTitle = ids.length === 1 ? 'Nosūtīt ziņu pieteikumu kontaktpersonai' : `Nosūtīt ziņu pieteikumu kontaktpersonām.`

    const handleSubmit = (values: any) => {
        const {notifyContactPersons, rejectReason} = values
        submitAction(notifyContactPersons, rejectReason, ids)
    }
    return (
        <Spin spinning={isLoading}>
            <Modal
                centered
                footer={null}
                open={true}
                onCancel={() => setModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{notifyContactPersons: false}}>
                    <Form.Item 
                        name="rejectReason" 
                        label={rejectReasonTitle}
                        rules={[{ required: true }]}    
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="notifyContactPersons" valuePropName="checked">
                        <Checkbox>{checkboxTitle}</Checkbox>
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalOpen(false)}>Atcelt</Button>
                        <Button htmlType="submit" type="primary">Atteikt</Button>
                    </div>
                </Form>
            </Modal>
        </Spin>
    )
}

export default RejectApplicationModal