'use client';

import {
  Button,
  Dropdown,
  Form,
  Modal,
  Spin,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import FileDownload from 'js-file-download';
import { useRef, useState, useEffect } from 'react';

import { AppConfig, dateFormat, permissions, reverseDateFormat } from '@/app/utils/AppConfig';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { handleScroll } from '@/app/utils/utils';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import useHandleError, { DEFAULT_ERROR_MESSAGE } from '@/app/utils/useHandleError';
import DocumentModal from '@/app/admin/document-templates/components/documentModal';
import Input from 'antd/es/input/Input';
import SearchSelectInput from '@/app/components/searchSelectInput';
import { ClassifierTermType } from '../../classifiers/components/classifierTerms';
import { Supervisor } from '@/app/types/Supervisor';
import { SelectOption } from '@/app/types/Antd';
import { useSession } from 'next-auth/react';

const { confirm } = Modal;
interface File {
  id: string;
  fileName: string;
}
interface DocumentType {
  id: string;
  code: string;
  value: string;
}
interface ResourceType {
  id: string;
  code: string;
  value: string;
}

export type DataType = {
  id: number;
  documentType: DocumentType;
  title: string;
  file: File;
  validFrom: string | Dayjs;
  validTo: string | Dayjs;
  show?: boolean;
}
interface DocumentOwnership {
  PermissionTypes?: number | undefined;
  SupervisorIds?: number | undefined;
}
const statusOptions: SelectOption[] = [
  { label: 'Spēkā', value: 'active' },
  { label: 'Nav spēkā', value: 'inactive' }
]
const currentTime = (addOne?: boolean, minusOne?: boolean) => {
  const date = new Date();
  if (addOne) {
    date.setDate(date.getDate() + 1);
  }
  if (minusOne) {
    date.setDate(date.getDate() - 1);
  }
  return dayjs(date).format(reverseDateFormat)
}

const DocumentTemplates = () => {
  const [form] = Form.useForm();
  const [activeName, setActiveName] = useState<string | null>(null);
  const [active, setActive] = useState<DataType | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [view, setView] = useState<boolean>(true);

  const pageTopRef = useRef(null);

  const [handleError] = useHandleError()

  const initialValues = {
    Page: 1,
    Take: AppConfig.takeLimit,
  };

  const [filter, setFilter] = useState(initialValues);
  
  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []
  
  const editPermission: boolean = userPermissions.includes(permissions.reportView)

  const {
    data: documents,
    appendData,
    refetch,
    isLoading,
  } = useQueryApiClient({
    request: {
      url: '/documentTemplates',
      data: filter,
    },
  });

  const { appendData: deleteAppendData } = useQueryApiClient({
    request: {
      url: `/documentTemplates/:documentId`,
      method: 'DELETE',
    },
    handleDefaultError: false,
    onSuccess: () => {
      setActive(null);
      refetch();
    },
    onError: (error) => {
      if (error.message === "error.deleteReference") {
        handleError({ error: 'Nav atļauts izdzēsts izmantoto šablonu' })
      } else {
        handleError({ error: DEFAULT_ERROR_MESSAGE })
      }
    },
  });

  const { appendData: downloadAppendData } = useQueryApiClient({
    request: {
      url: `/documentTemplates/:id/download`,
      method: 'GET',
      multipart: true,
      disableOnMount: true,
    },
    onSuccess: async (response) => {
      setActive(null);
      setActiveName(null);
      if (activeName) {
        FileDownload(response, activeName);
      }
    },
  });

  const {
    isLoading: documentsLoading,
    data: documentTypes
  } = useQueryApiClient({
    request: {
      url: `/classifiers/getbytype`,
      data: {
        types: ['document_type', 'resource_type'],
        includeDisabled: false
      }
    },
  });
  const {
    isLoading: supervisorsLoading,
    data: supervisors
  } = useQueryApiClient({
    request: {
      url: `/Supervisors`,
    },
  });

  const showConfirm = (documentId: number) => {
    confirm({
      title: 'Vai tiešām vēlaties dzēst šos vienumus?',
      okText: 'Dzēst',
      okType: 'danger',
      cancelText: 'Atcelt',
      async onOk() {
        deleteAppendData([], { documentId });
      },
      onCancel() { },
    });
  };

  const fetchRecords = (page: number, pageSize: number) => {
    const newPage = page !== filter.Page ? page : 1;
    const newFilter = { ...filter, Page: newPage, take: pageSize };
    setFilter(newFilter);
    appendData(newFilter);
  };

  useEffect(() => {
    if (activeName && active?.id) {
      downloadAppendData([], { id: active?.id });
    }
  }, [activeName, active?.id]);

  const download = (data: DataType) => {
    setActive(data);
    setActiveName(data.title);
  };

  const items = (record: DataType) => {
    return {
      items: [
        {
          key: '1',
          label: (
            <button type="button" onClick={() => {
              setActive(record)
              setModalOpen(true)
              setView(false)
            }}>
              Labot
            </button>
          ),
        },
        {
          key: '2',
          label: (
            <button type="button" onClick={() => showConfirm(record.id)}>
              Dzēst
            </button>
          ),
        },
      ],
    };
  };

  const handleDocumentFilter = (values: any) => {
    const ownership: DocumentOwnership = values?.SupervisorIds === "Country" ? { PermissionTypes: 0 } : { SupervisorIds: values?.SupervisorIds };
    let documentStatus = {};
    if (values?.Status) {
      if (values?.Status === 'active') {
        documentStatus = { ValidFromMax: currentTime(false, false), ValidToMin: currentTime(false, false) }
      } else if (values?.Status === 'inactive') {
        documentStatus = { ValidFromMin: currentTime(true, false), ValidToMin: currentTime(false, true) }
      }
    }
    const newFilter = {
      ...filter,
      Title: values.Title,
      ...ownership,
      ...documentStatus,
      Codes: values.Codes,
      ResourceTypeIds: values.ResourceTypeIds,
      Page: 1,
    };
    appendData(newFilter);
  }

  const initialColumns = [
    {
      title: 'Kods',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (documentType: DocumentType) => `${documentType?.code}`,
      show: true
    },
    {
      title: 'Dokumenta veidnes nosaukums',
      dataIndex: 'title',
      key: 'title',
      show: true
    },
    {
      title: 'Dokumenta veids',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (documentType: DocumentType) => `${documentType?.value}`,
      show: true
    },
    {
      title: 'Resursa veids',
      dataIndex: 'resourceType',
      key: 'resourceType',
      render: (resourceType: ResourceType) => `${resourceType?.value}`,
      show: true
    },
    {
      title: 'Dokumenta veidnes piederība',
      dataIndex: 'permissionType',
      key: 'permissionType',
      show: true
    },
    {
      title: 'Fails',
      dataIndex: 'file',
      key: 'file',
      render: (file: File, record: DataType) => (
        <button
          type="button"
          onClick={() => download(record)}
        >
          {file.fileName}
        </button>
      ),
      show: true
    },
    {
      title: 'Derīgs no',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (value: string | null) =>
        value && dayjs(value).format(dateFormat),
      show: true
    },
    {
      title: 'Derīgs līdz',
      dataIndex: 'validTo',
      key: 'validTo',
      render: (value: string | null) =>
        value && dayjs(value).format(dateFormat),
      show: true
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      width: '150px',
      render: (_: any, record: DataType) => (
        <Dropdown.Button
          onClick={() => {
            setActive(record)
            setModalOpen(true)
            setView(true)
          }}
          menu={items(record)}
        >
          Skatīt
        </Dropdown.Button>
      ),
      show: editPermission
    },
  ];

  const columns: ColumnsType<DataType> = initialColumns.filter(column => column.show)

  return (
    <div>
      <div ref={pageTopRef}>
        <div className='bg-white p-6 rounded-lg mb-[10px]'>
          <Spin spinning={documentsLoading || supervisorsLoading}>
            <Form
              form={form}
              name="document-templates"
              onFinish={handleDocumentFilter}
              layout="vertical"
              className="flex gap-6"
            >
              <div className='flex-1 flex flex-col justify-between'>
                <Form.Item name="Title" label="Dokumenta veidnes nosaukums">
                  <Input placeholder='Nosaukums' />
                </Form.Item>
                <Form.Item>
                  <div className='flex gap-6'>
                    <Button type='primary' htmlType="submit" loading={isLoading}>Atlasīt</Button>
                    <Button onClick={() => form.resetFields()}>Notīrīt</Button>
                  </div>
                </Form.Item>
              </div>
              <div className='flex-1'>
                <Form.Item name="SupervisorIds" label="Dokumenta veidnes piederība">
                  <SearchSelectInput placeholder="Dokumenta veidnes piederība"
                    allowClear
                    options={[
                      {
                        label: "Country",
                        value: "Country",
                        code: "Country"
                      },
                      ...supervisors?.map((item: Supervisor) => ({
                        label: item.name,
                        value: item.id,
                        code: item.code
                      }))
                    ]}
                  />
                </Form.Item>
                <Form.Item name="Codes" label="Dokumenta veidnes veids">
                  <SearchSelectInput placeholder="Dokumenta veidnes veids"
                    allowClear
                    options={documentTypes?.filter((item: ClassifierTermType) => item.type === "document_type").map((item: ClassifierTermType) => ({
                      label: item.value,
                      value: item.code,
                    }))}
                  />
                </Form.Item>
              </div>
              <div className='flex-1'>
                <Form.Item label="Statuss" name="Status">
                  <SearchSelectInput
                    options={statusOptions}
                    placeholder="Statuss"
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="ResourceTypeIds" label="Resursa veids">
                  <SearchSelectInput
                    placeholder="Resursa veids"
                    allowClear
                    options={documentTypes?.filter((item: ClassifierTermType) => item.type === "resource_type")?.map((item: ClassifierTermType) => ({
                      label: item.value,
                      value: item.id,
                      code: item.code
                    }))}
                  />
                </Form.Item>
              </div>
            </Form>
          </Spin>
        </div>

        <div className='overflow-auto bg-white p-6 rounded-lg'>
          {editPermission &&
            <div className="text-right">
              <ButtonWithIcon
                event={() => {
                  setModalOpen(true)
                  setView(false)
                }}
                label="Izveidot"
              />
            </div>
          }
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={documents?.items}
            pagination={{
              current: filter.Page,
              total: documents?.total,
              onChange: (page, takeLimit) => {
                fetchRecords(page, takeLimit);
                handleScroll(pageTopRef.current);
              },
            }}
            rowKey={(record) => record.id}
          />
        </div>
      </div>
      {
        modalOpen &&
        <DocumentModal
          setModalOpen={setModalOpen}
          document={active}
          setActiveDocument={setActive}
          refetchDocuments={refetch}
          view={view}
          setView={(e: boolean) => setView(e)}
        />
      }
    </div >
  );
};

export { DocumentTemplates };
