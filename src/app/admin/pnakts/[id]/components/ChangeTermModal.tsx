import { datePickerFormat } from "@/app/utils/AppConfig"
import { Button, Checkbox, DatePicker, Form, Modal } from "antd"
import { useForm } from "antd/es/form/Form"
import { Dispatch, SetStateAction } from "react"

type ChangeTermModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

const ChangeTermModal = ({setModalOpen}: ChangeTermModalProps) => {
    const [form] = useForm()
    
    const onFinish = (values: any) => {
        setModalOpen(false)
    }
    return (
        <Modal
            open={true}
            onCancel={() => setModalOpen(false)}
            footer={false}
            // width={900}
        >
            <Form
                form={form}
                name="change-term"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="returnDate"
                    label="Lūdzu norādīt resursa jauno atgriešanas termiņu"
                    rules={[{required: true, message:"Lūdzu izvēlieties athriešanas termiņu."}]}
                >
                    <DatePicker format={datePickerFormat} />
                </Form.Item>
                <Form.Item name="notifyContactPersons" valuePropName="checked">
                    <Checkbox>Nosūtīt ziņu pieteikuma kontaktpersonai.</Checkbox>
                </Form.Item>
                <div className="flex justify-center gap-2">
                    <Button type="default" onClick={() => setModalOpen(false)}>Atcelt</Button>
                    <Button type="primary" htmlType="submit">Saglabāt</Button>
                </div>
            </Form>
        </Modal>
    )
}

export default ChangeTermModal