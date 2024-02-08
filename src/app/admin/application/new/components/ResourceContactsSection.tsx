'use client';

import {
  Form,
  Typography,
  Space,
  Input,
} from 'antd';

const { Title, Text } = Typography;

const ResourceContactsSection = () => {
    return (
        <>
            <Title level={4} className='mt-2'>Kontaktinformācija</Title>
            <Form.Item>
                <div className='flex flex-col sm:flex-row gap-[8px]'>
                    <Form.Item
                        name="email"
                        label="E-pasta adrese"
                        rules={[{ required: true, message:"Lūdzu ievadiet e-pasta adresi." }, {type: 'email'}]}
                    >
                        <Input type="email" className='w-full sm:!w-[200px]'/>
                    </Form.Item>
                    <Form.Item
                        name="phoneNumber"
                        label="Tālrunis"
                        rules={[
                            { required: true, message:"Lūdzu ievadiet tālruni" },
                            {
                            pattern: /^[0-9+]*$/i,
                            message: 'Atļautie simboli 0-9, +',
                            },
                            { max: 15},
                        ]}
                        className='w-full sm:!w-[200px]'
                    >
                        <Input />
                    </Form.Item>
                </div>
            </Form.Item>
        </>
    )
}

export default ResourceContactsSection