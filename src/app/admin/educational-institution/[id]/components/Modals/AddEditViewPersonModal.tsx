'use client'

import { Button, Form, Input, Modal } from "antd"
import { useForm } from "antd/es/form/Form"
import { Dispatch, SetStateAction, useState } from "react"

type AddEditViewPersonModalProps = {
    closeModal: Function
    initialFormMode: 'ADD' | 'EDIT' | 'VIEW'
    onSubmit: Function
    currentPerson: any
}

const AddEditViewPersonModal = ({closeModal, initialFormMode, onSubmit, currentPerson}: AddEditViewPersonModalProps) => {
    const [formMode, setFormMode] = useState<'ADD' | 'EDIT' | 'VIEW'>(initialFormMode)

    const [form] = useForm()

    const onFinish = (values: any) => {
        onSubmit(values)
        closeModal()
    }

    return (
        <Modal
            footer={null}
            open={true}
            onCancel={() => closeModal()}
        >
            <Form form={form} onFinish={onFinish} layout="vertical" initialValues={currentPerson ?? {}}>
                <Form.Item label="Nosaukums / vārds, uzvārds" name="name" rules={[
                    {
                        required: true,
                        message: 'Nosaukums / vārds, uzvārds ir obligāts lauks'
                    }
                    ]}
                >
                    <Input bordered={formMode !== 'VIEW'} disabled={formMode === 'VIEW'} style={{color: 'rgba(0, 0, 0, 0.88)'}}/>
                </Form.Item>
                <Form.Item label="Adrese" name="address" rules={[
                    {
                        required: true,
                        message: 'Adrese ir obligāts lauks'
                    }
                    ]}
                >
                    <Input bordered={formMode !== 'VIEW'} disabled={formMode === 'VIEW'} style={{color: 'rgba(0, 0, 0, 0.88)'}}/>
                </Form.Item>
                <Form.Item label="E-pasta adrese" name="email" rules={[
                    { type: 'email' , message: "Nepareizs formāts"},
                    {
                        required: true,
                        message: 'E-pasta adrese ir obligāts lauks'
                    }
                    ]}
                >
                    <Input bordered={formMode !== 'VIEW'} disabled={formMode === 'VIEW'} style={{color: 'rgba(0, 0, 0, 0.88)'}}/>
                </Form.Item>
                <Form.Item 
                    label="Tālrunis" 
                    name="phoneNumber"
                    rules={[
                        {
                            pattern: /^[0-9+]*$/i,
                            message: 'Atļautie simboli 0-9, +',
                        },
                        {
                            required: true,
                            message: 'Tālrunis ir obligāts lauks'
                        }
                    ]}    
                >
                    <Input bordered={formMode !== 'VIEW'} disabled={formMode === 'VIEW'} style={{color: 'rgba(0, 0, 0, 0.88)'}} />
                </Form.Item>
                {(formMode === 'ADD' || formMode === 'EDIT') &&
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => closeModal()}>Aizvērt</Button>
                        <Button type="primary" htmlType="submit">Saglabāt</Button>
                    </div>
                }
                {formMode === 'VIEW' &&
                    <div className="flex justify-end gap-2">
                        <Button type="primary" onClick={() => setFormMode('EDIT')}>Labot</Button>
                        <Button onClick={() => closeModal()}>Aizvērt</Button>
                    </div>
                }
            </Form>
        </Modal>
    )
}

export default AddEditViewPersonModal