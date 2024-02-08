import { Button, Checkbox, Form, Modal, Spin, Typography } from "antd"
import { Dispatch, SetStateAction } from "react"

type DeleteApplicationModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    ids: string[]
    isLoading: boolean
    submitAction: Function
}

const {Title} = Typography

const DeleteApplicationModal = ({setModalOpen, ids, isLoading, submitAction}: DeleteApplicationModalProps) => {
    const [form] = Form.useForm();

    const modalTitle = ids.length === 1 ? 'Pieteikums tiks dzēsts.' : `${ids.length} pieteikumi tiks dzēsti`
    const checkboxTitle = ids.length === 1 ? 'Nosūtīt ziņu pieteikumu kontaktpersonai' : `Nosūtīt ziņu pieteikumu kontaktpersonām.`

    const handleSubmit = (values: any) => {
        const {notifyContactPersons} = values
        submitAction(notifyContactPersons, ids)
    }
    return (
        <Spin spinning={isLoading}>
            <Modal
                title={modalTitle}
                centered
                footer={null}
                open={true}
                onCancel={() => setModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{notifyContactPersons: false}}>
                    <Title level={5}>Vēlaties turpināt?</Title>
                    <Form.Item name="notifyContactPersons" valuePropName="checked">
                        <Checkbox>{checkboxTitle}</Checkbox>
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalOpen(false)}>Atcelt</Button>
                        <Button type="primary" htmlType="submit">Turpināt</Button>
                    </div>
                </Form>
            </Modal>
        </Spin>
    )
}

export default DeleteApplicationModal