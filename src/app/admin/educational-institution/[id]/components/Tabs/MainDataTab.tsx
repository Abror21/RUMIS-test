'use client'

import { Form, FormInstance, Input, Typography } from "antd"

const { Title } = Typography

type MainDataTabProps = {
    form: FormInstance
}

const MainDataTab = ({form}: MainDataTabProps) => {
    const city = Form.useWatch('city', form)
    const district = Form.useWatch('district', form)
    const village = Form.useWatch('village', form)

    return (
        <div>
            <Title level={4}>Adrese</Title>
            <div className="flex gap-6">
                <div className="w-1/2">
                    <Form.Item 
                        name="address" 
                        label="Iela, māja" 
                        rules={[{ required: true, message: "Iela, māja ir obligāts lauks" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="district" 
                        label="Pagasts"
                        rules={[{ required: !city && !village, message: "Ciems ir obligāts lauks" }]}    
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="city" 
                        label="Pilsēta"
                        rules={[{ required: !village && !district, message: "Ciems ir obligāts lauks" }]}
                    >
                        <Input />
                    </Form.Item>
                </div>
                <div className="w-1/2">
                    <Form.Item 
                        name="village" 
                        label="Ciems"
                        rules={[{ required: !city && !district, message: "Ciems ir obligāts lauks" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="municipality" label="Novads" >
                        <Input />
                    </Form.Item>
                </div>
            </div>
            <Title level={4}>Kontaktinformācija</Title>
            <div className="flex gap-6">
                <div className="w-1/2">
                    <Form.Item name="phoneNumber" label="Tālrunis" rules={[{ required: true , message: "Tālrunis ir obligāts lauks"}]}>
                        <Input />
                    </Form.Item>
                </div>
                <div className="w-1/2">
                    <Form.Item name="email" label="E-pasta adrese" rules={[{ required: true, message: "E-pasta adres ir obligāts lauks" }]}>
                        <Input />
                    </Form.Item>
                </div>
            </div>
        </div>
    )
}

export default MainDataTab