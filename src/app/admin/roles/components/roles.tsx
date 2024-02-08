'use client';

import {
  Button,
  Dropdown,
  Form,
  Input,
  Table,
  Modal,
  Select
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

import { AppConfig, permissions} from '@/app/utils/AppConfig';
import { handleScroll } from '@/app/utils/utils';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import useHandleError, { DEFAULT_ERROR_MESSAGE } from '@/app/utils/useHandleError';

const { confirm } = Modal;
const { Option } = Select;

interface DataType {
  id: string;
  name: string;
  code: string;
  readOnly: boolean;
  permissions: string[];
  show: boolean;
}

const Roles = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState<DataType | null>(null);
  const [form] = Form.useForm();
  const pageTopRef = useRef(null);
  const [filter, setFilter] = useState(() => {
    return {
      page: 1,
      take: AppConfig.takeLimit,
    }
  });

  const [handleError] = useHandleError();

  const { data: roles, appendData, refetch, isLoading } = useQueryApiClient({
    request: {
      url: '/roles',
    },
  });

  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []
  const editPermission: boolean = userPermissions.includes('role.edit')

  const fetchRecords = (page: number, pageSize: number) => {
    const newPage = page !== filter.page ? page : 1;
    const newFilter = { ...filter, page: newPage, take: pageSize };
    setFilter(newFilter);
    appendData(newFilter);
  };

  const { appendData: createAppendData, isLoading: postLoader } = useQueryApiClient({
    request: {
      url: active?.id ? `/roles/${active?.id}` : `/roles`,
      method: active?.id ? 'PUT' : 'POST',
    },
    onSuccess: () => {
      setActive(null);
      setModalOpen(false);
      form.resetFields();
      refetch();
    },
    handleDefaultError: false,
    onError: (error) => {
      if (error?.message === 'permission.groupsOverlapped'){
        handleError({ error: 'Tiesību konflikts' })
      } else {
        handleError({ error: DEFAULT_ERROR_MESSAGE })
      }
    },
  });

  const { appendData: deleteAppendData  } = useQueryApiClient({
    request: {
      url: `/roles/:roleId`,
      method: 'DELETE',
    },
    onSuccess: () => {
      setActive(null);
      refetch();
    },
  });

  const showConfirm = (roleId: string) => {
    confirm({
      title: 'Vai tiešām vēlaties dzēst šos vienumus?',
      okText: 'Dzēst',
      okType: 'danger',
      cancelText: 'Atcelt',
      async onOk() {
        deleteAppendData([], { roleId });
      },
      onCancel() { },
    });
  };

  const items = (record: DataType) => {
    return {
      items: [
        {
          key: '1',
          label: (
            <button type="button" onClick={() => showConfirm(record.id)}>
              Dzēst
            </button>
          ),
        },
      ],
    };
  };

  const handleEdit = (data: DataType) => {
    setActive(data);
    form.setFieldsValue(data);
    setModalOpen(true);
  };

  const initialColumns = [
    {
      title: 'Nosaukums',
      dataIndex: 'name',
      key: 'name',
      show: true
    },
    {
      title: 'Kods',
      dataIndex: 'code',
      key: 'code',
      show: true
    },
    {
      title: 'Tiesības',
      dataIndex: 'permissions',
      render: (AssignedPermissions: any[]) => AssignedPermissions.join(', '),
      key: 'permissions',
      show: true,
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      width: '150px',
      render: (_: any, record: DataType) => (
        <Dropdown.Button
          onClick={() => handleEdit(record)}
          menu={items(record)}
        >
          Labot
        </Dropdown.Button>
      ),
      show: editPermission
    },
  ];
  const columns: ColumnsType<DataType> =  initialColumns.filter(column => column.show)

  const handleRole = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    createAppendData(values);
  };

  const handleCancel = () => {
    setModalOpen(false)
    form.resetFields()
    setActive(null)
  };


  return (
    <div>
      {editPermission &&
        <div className="text-right">
          <ButtonWithIcon
            event={() => setModalOpen(true)}
            label="Izveidot"
          />
        </div>
      }
      <div className='overflow-auto'>
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={roles?.items}
          rowKey={(record) => record.id}
          pagination={{
            current: filter.page,
            total: roles?.total,
            onChange: (page, takeLimit) => {
              fetchRecords(page, takeLimit);
              handleScroll(pageTopRef.current);
            },
          }}
        />
      </div>
      <Modal
        title={active ? `Rediģēt lomu - ${active.name}` : 'Jauna loma'}
        centered
        open={modalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Atcelt
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={postLoader}
            onClick={handleRole}
          >
            Saglabāt
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nosaukums"
            name="name"
            rules={[{ required: true, message: 'Nosaukums ir obligāts' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="Kods" 
            name="code"
            rules={[
              { required: true, message: 'Kods ir obligāts' },
              {max: 50, message: 'Maksimālais garums: 50'}
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="permissions" label="Tiesības">
            <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Lūdzu izvēlēties"
            >
              {Object.keys(permissions).map((index: string) => {
                const name: string =
                    permissions[index as keyof typeof permissions];

                return (
                    <Option key={index} value={name}>
                      {name}
                    </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;

