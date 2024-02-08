'use client'

import { CheckOutlined } from '@ant-design/icons';
import antd, { Button, Form, Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { UserModal } from '../admin/users/components/userModal';
import useQueryApiClient from '../utils/useQueryApiClient';
import { UserType } from '../admin/users/components/users';

interface UserProfileProps {
  title: string,
  status?: boolean,
  label?: boolean,
  allowEdit?: boolean,
  person?: {
    firstName: string;
    lastName: string;
    privatePersonalIdentifier: string
  }
  setPerson?: Function
  userId?: string | null
  refresh?: () => void
}
const antdTemp = antd; // this is for unit testing
const { Title, Paragraph } = Typography;

const UserProfile = ({ title, status = false, label = true, allowEdit = false, person = undefined, setPerson = undefined, userId = null, refresh = undefined}: UserProfileProps) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)


  const [form] = Form.useForm();

  useEffect(() => {
    if (!isUserModalOpen) {
      form.resetFields()
    } else if (person) {
      form.setFieldsValue(person)
    }
  }, [isUserModalOpen])
  const { appendData: editPerson, isLoading: personLoader } =
    useQueryApiClient({
      request: {
        url: `/persons/:userId`,
        method: 'PUT',
      },
      onSuccess: () => {
        const values = { ...form.getFieldsValue(true) }

        if (setPerson) {
          setPerson({
            firstName: values.firstName,
            lastName: values.lastName,
            privatePersonalIdentifier: values.privatePersonalIdentifier
          })
        }
        setIsUserModalOpen(false)
        
        if (refresh) {
          refresh()
        }
        
        form.resetFields();

      },
    });

    const onSubmit = async  () => {
      await form.validateFields()
      const values = { ...form.getFieldsValue(true) }

      editPerson({
        firstName: values.firstName,
        lastName: values.lastName,
        privatePersonalIdentifier: values.privatePersonalIdentifier,
      }, {userId: userId})
    }
  return (
    <div data-testid="test-div" className='border-b mb-5 pb-3'>
      { label &&
        <span className='block text-sm'>Persona</span>
      }
      <div className='flex justify-between'>
        <span className='block text-lg'>{title} {status && <CheckOutlined />}</span>
        {allowEdit && 
          <Button onClick={() => setIsUserModalOpen(true)}>
            Rediģēt
          </Button>}
        </div>
        {isUserModalOpen &&
          <Modal 
            data-testid="test-modal"
            open={true}
            onCancel={() => setIsUserModalOpen(false)}
            footer={<div className='flex'>
              <div className="ml-auto">
                <Button key="back" onClick={() => setIsUserModalOpen(false)}>
                  Atcelt
                </Button>
                  <Button
                    key="submit"
                    type="primary"
                    onClick={onSubmit}
                  >
                    Saglabāt
                  </Button>
              </div>
            </div>
            }
          >
            <Form 
              form={form} 
              layout="vertical"
              initialValues={person}
            >
                <Form.Item
                  label="Personas kods"
                  name="privatePersonalIdentifier"
                  extra="Ievadīt bez domu zīmes."
                  rules={[{ required: true, pattern: new RegExp(/^\d{11}$/), message: "Atļauts ievadīt tikai 11 ciparus." }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Vārds"
                  name="firstName"
                  rules={[{ required: true, message: "Vārds ir obligāts lauks."}]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Uzvārds"
                  name="lastName"
                  rules={[{ required: true, message: "Uzvārds ir obligāts lauks." }]}
                >
                  <Input />
                </Form.Item>
                <Paragraph>
                  Vārds un uzvārds tiks atjaunots automātiski pēc personas autentificēšanās ar Latvija.lv
                </Paragraph>
              </Form>
          </Modal>
        }
    </div>
  );
}

export { UserProfile };
