'use client';

import {
  Button,
  Form,
  Input,
  Table,
  Modal,
  Upload,
  UploadFile,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { UploadOutlined } from '@ant-design/icons';
import useHandleError from '@/app/utils/useHandleError';

interface DataType {
  id: string;
  code: string;
  value: string;
}

const RESOURCE_IMPORT_TEMPLATE = "resource_import_template"

const Parameters = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState<DataType | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [handleError] = useHandleError();
  
  const [form] = Form.useForm();

  const { data: parameters, refetch, isLoading } = useQueryApiClient({
    request: {
      url: '/parameters',
    },
  });

  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []
  const editPermission: boolean = userPermissions.includes('parameter.edit')

  const isResourceImportTemplate = useMemo(() => {
    return active?.code === RESOURCE_IMPORT_TEMPLATE
  }, [active])

  const uploadProps = useMemo(
      () => ({
        beforeUpload: (file: UploadFile) => {
          if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            handleError({error: 'Nepareizs faila formāts'})
            return false
          }

          setFileList((state) => [file]);
          return false;
        },
        onRemove: (file: UploadFile) => {
          if (fileList.some((item) => item.uid === file.uid)) {
            setFileList((fileListItems) =>
              fileListItems.filter((item) => item.uid !== file.uid),
            );
            form.setFieldValue('file', undefined)
            return false;
          }
          return false;
        },
        maxCount: 1,
        fileList: fileList
      }),
      [fileList],
  );

  const { appendData, isLoading: postLoader } = useQueryApiClient({
    request: {
      url: `/parameters/:id`,
      method: 'PUT',
    },
    onSuccess: () => {
      setActive(null);
      setModalOpen(false);
      form.resetFields();
      refetch();
      setFileList([])
    },
  });

  const { appendData: uploadImportTemplate, isLoading: uploadImportTemplateLoader } = useQueryApiClient({
    request: {
      url: `/resources/uploadImportTemplate`,
      method: 'PUT',
      multipart: true
    },
    onSuccess: () => {
      setActive(null);
      setModalOpen(false);
      form.resetFields();
      refetch();
      setFileList([])
    },
  });

  const { refetch: downloadImportTemplate } = useQueryApiClient({
    request: {
      url: `/resources/downloadImportTemplate`,
      method: 'GET',
      disableOnMount: true,
      multipart: true
    },
    onSuccess: async (response) => {
      const file = new File(
        [response],
        'Šablons.xlsx',
        {
          lastModified: new Date().getTime(),
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      )
      // To avoid validation error
      form.setFieldValue('file', 1)
      // @ts-ignore
      setFileList([file])
    },
  });

  const handleEdit = (data: DataType) => {
    setActive(data);
    form.setFieldsValue(data);
    setModalOpen(true);

    if (data?.code === RESOURCE_IMPORT_TEMPLATE && data?.value) {
      downloadImportTemplate()
    }
  };

  const initialColumns = [
    {
      title: 'Vērtība',
      dataIndex: 'value',
      key: 'value',
      show: true
    },
    {
      title: 'Kods',
      dataIndex: 'code',
      key: 'code',
      show: true
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      width: '150px',
      render: (_: any, record: DataType) => (
        <Button
          onClick={() => handleEdit(record)}
        >
          Labot
        </Button>
      ),
      show: editPermission
    },
  ];

  const columns: ColumnsType<DataType> =  initialColumns.filter(column => column.show)

  const handleParameter = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    if (!isResourceImportTemplate) {
      if (active?.id) {
        appendData(values, { id: active.id });
      }
    } else {
      const formData = new FormData()
      // @ts-ignore
      formData.append('file', fileList[0]);
      uploadImportTemplate(formData)
    }
  };

  const handleCancel = () => {
    setModalOpen(false)
    form.resetFields()
    setActive(null)
    setFileList([])
  };

  return (
    <div>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={parameters}
        pagination={false}
        rowKey={(record) => record.id}
      />
      <Modal
        title={active && `Parametra - ${active.code} redģēšana`}
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
            loading={postLoader || uploadImportTemplateLoader}
            onClick={handleParameter}
          >
            Saglabāt
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          {!isResourceImportTemplate
          ?
            <Form.Item
              label="Vērtība"
              name="value"
              rules={[{ required: true, message: 'Vērtība ir obligāta' }]}
            >
              <Input />
            </Form.Item>
          : 
            <Form.Item
              label="Vērtība"
              name="file"
              rules={[{ required: true, message: 'Vērtība ir obligāta' }]}
            >
              <Upload {...uploadProps} accept=".xlsx">
                  <Button icon={<UploadOutlined />}>Izvēlēties failu</Button>
                </Upload>
            </Form.Item>
          }
          <Form.Item label="Kods" name="code">
            <Input disabled={true} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Parameters;

