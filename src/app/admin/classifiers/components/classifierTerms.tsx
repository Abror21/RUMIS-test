'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {useEffect, useState} from 'react';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import { useSession } from 'next-auth/react';

import useQueryApiClient from '@/app/utils/useQueryApiClient';
import SearchSelectInput from "@/app/components/searchSelectInput";
import {ClassifierListTermType} from "@/app/admin/classifiers/components/classifiers";
import {EducationalInstitution} from "@/app/types/EducationalInstitution";
import LinkButton from '@/app/components/LinkButton';
import { ClassifierResponse } from '@/app/types/Classifiers';
import ClassifierPayload from '@/app/admin/classifiers/components/classifierPayload';
import { isJson } from '@/app/utils/utils';

const { confirm } = Modal;

export interface ClassifierTermType {
  id: string;
  type: string;
  code: string;
  value: string;
  payload?: string;
  sortOrder?: number;
  isDisabled?: boolean;
  isRequired?: boolean;
  resource_type?: string;
  parameters?: ClassifierTermType[];
  show: boolean;
  permissionType: string;
  educationalInstitutionId: number | null;
  supervisorId: number | null;
}

export interface Payload {
  key: number;
  resource_parameter_group: string;
  parameters?: string[];
}

const ClassifierTerms = ({ classifierId, classifierName }: { classifierId: string, classifierName: string }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [allEducationalInstitution, setAllEducationalInstitution] = useState<EducationalInstitution[]>([])
  const [filteredEducationalInstitution, setFilteredEducationalInstitution] = useState<EducationalInstitution[]>([])
  const [classifierPermissionType, setClassifierPermissionType] = useState<string | null>(null)
  const [currentClassifierData, setCurrentClassifierData] = useState<any>({})
  const [payload, setPayload] = useState<ClassifierTermType[]>([])

  const [id, setId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []
  const editPermission: boolean = userPermissions.includes('classifier.edit')

  const initialValues = {
    type: classifierId,
  };

  const supervisorId = Form.useWatch('supervisorId', form)

  useEffect(() => {
    if (supervisorId) {
      const filteredValues = allEducationalInstitution.filter(edu => edu.supervisor.id === supervisorId)
      setFilteredEducationalInstitution(filteredValues)

      if (!filteredValues.find(v => v.id === educationalInstitutions)) {
        form.setFieldValue('educationalInstitutionId', null)
      }
    }
  }, [supervisorId])

  const {
    data: terms,
    refetch,
    isLoading,
  } = useQueryApiClient({
    request: {
      url: `/classifiers`,
      data: {
        type: classifierId,
        includeDisabled: true
      }
    },
  });

  const {
    data: resourceTypes
  } = useQueryApiClient({
    request: {
      url: `/classifiers`,
      data: {
        type: 'resource_type',
        includeDisabled: false
      }
    },
    enabled: (classifierId === 'resource_subtype')
  });

  const {} = useQueryApiClient({
    request: {
      url: `/classifiers?type=classifier_type&code=${classifierId}&includeDisabled=true`,
    },
    onSuccess: (response: ClassifierResponse[]) => {
      if (response && response[0]) {
        setClassifierPermissionType(response[0]?.permissionType)
        setCurrentClassifierData(response[0])
      }
    }
  });

  const { appendData: createAppendData, isLoading: postLoader } = useQueryApiClient({
    request: {
      url: id ? `/classifiers/${id}` : `/classifiers`,
      method: id ? 'PUT' : 'POST',
    },
    onSuccess: () => {
      setModalOpen(false);
      form.resetFields();
      setPayload([])
      refetch();
    },
  });

  const { appendData: deleteAppendData } = useQueryApiClient({
    request: {
      url: `/classifiers/:termId`,
      method: 'DELETE',
    },
    onSuccess: () => {
      setId(null);
      setPayload([])
      refetch();
    },
  });

  const { data: supervisors } = useQueryApiClient({
    request: {
      url: '/supervisors',
    }
  });

  const { data: educationalInstitutions } = useQueryApiClient({
    request: {
      url: '/educationalInstitutions',
    },
    onSuccess: (response: EducationalInstitution[]) => {
      setAllEducationalInstitution(response)
      setFilteredEducationalInstitution(response)
    }
  });

  const showConfirm = (termId: string) => {
    confirm({
      title: 'Vai tiešām vēlaties dzēst šos vienumus?',
      okText: 'Dzēst',
      okType: 'danger',
      cancelText: 'Atcelt',
      async onOk() {
        deleteAppendData([], { termId });
      },
      onCancel() { },
    });
  };

  const handleCancel = () => {
    setModalOpen(false)
    form.resetFields()
    setId(null)
    setPayload([])
  };

  const handleEdit = (data: ClassifierTermType) => {
    setId(data.id);

    if (data.payload) {
      if (isJson(data.payload)) {
        const payload = JSON.parse(data.payload);
        if (payload?.groups) {
          setPayload(payload.groups);
        }
        data.resource_type = payload?.resource_type;
      }
    }
    form.setFieldsValue(data);
    setModalOpen(true);
  };

  const createTerm = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    if (classifierId === 'resource_subtype') {
      values.payload = JSON.stringify({
        resource_type: values.resource_type,
        groups: payload
      });
    }
    createAppendData(values);
  };

  const items = (record: ClassifierTermType) => {
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

  const initialColumns = [
    {
      title: 'Kods',
      dataIndex: 'code',
      key: 'code',
      show: true
    },
    {
      title: 'Vērtība',
      dataIndex: 'value',
      key: 'value',
      show: true
    },
    {
      title: 'Papildus parametri',
      dataIndex: 'payload',
      key: 'payload',
      show: true
    },
    {
      title: 'Status',
      dataIndex: 'isDisabled',
      render: (status: boolean) => {
        if (status) {
          return 'Neaktīvs';
        }
        return 'Aktīvs';
      },
      key: 'isDisabled',
      show: true
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      width: '150px',
      render: (_: any, record: ClassifierTermType) => {
        const show = showAddEditButton(record)
        
        return show ? <Dropdown.Button
          onClick={() => handleEdit(record)}
          menu={items(record)}
        >
          Labot
        </Dropdown.Button> : null
      },
      show: editPermission
    },
  ];
  const columns: ColumnsType<ClassifierTermType> = initialColumns.filter(column => column.show)

  const validateJson = (rule: any, value: any, callback: any) => {
    try {
      if (value) {
        JSON.parse(value);
      }
      callback();
    } catch (error) {
      callback('Ievādiet datus JSON formātā');
    }
  };

  const showAddEditButton = (record: any): boolean => {
      const classifierPermissionType = record?.permissionType
      const permissionType = sessionData?.user?.permissionType
      let show = false

      if (permissionType === 'Country') {
        show = true
      }

      if (classifierPermissionType === permissionType) {
        if (classifierPermissionType === 'EducationalInstitution') {
          if (sessionData?.user?.educationalInstitutionId === record.educationalInstitutionId) {
            show = true
          }
        }
        if (classifierPermissionType === 'Supervisor') {
          if (sessionData?.user?.supervisor === record.supervisorId) {
            show = true
          }
        }
      }

      return show
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <Row>
        <Col span={12}>
          <LinkButton type="text" href='/admin/classifiers'>
            <Space>
              <ArrowLeftOutlined />
              Skatīt sarakstu
            </Space>
          </LinkButton>
        </Col>
        <Col span={12} className="text-right">
          {(editPermission && showAddEditButton(classifierPermissionType)) &&
            <ButtonWithIcon
              event={() => setModalOpen(true)}
              label="Izveidot"
            />
          }
        </Col>
      </Row>
      <div className='overflow-auto'>
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={terms}
          rowKey={(record) => record.id}
          pagination={false}
        />
      </div>
      {modalOpen &&
        <Modal
          title={
            id
              ? `Rediģēt klasifikatora vērtību - ${classifierName}`
              : 'Jauna klasifikatora vērtība'
          }
          centered
          width={1000}
          open={true}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Atcelt
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={postLoader}
              onClick={createTerm}
            >
              Saglabāt
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item label="Tips" name="type">
              <Input disabled />
            </Form.Item>
            {classifierPermissionType === 'Supervisor' &&
              <Form.Item
                  name="supervisorId"
                  label="Vadošā iestāde"
                  rules={[{ required: true }]}
              >
                <SearchSelectInput options={supervisors.map((value: ClassifierListTermType) => ({
                  label: value.name,
                  value: value.id,
                }))}
                />
              </Form.Item>
            }
            {classifierPermissionType === 'EducationalInstitution' &&
              <Form.Item
                  name="educationalInstitutionId"
                  label="Izglītības iestāde"
                  rules={[{ required: true }]}
              >
                <SearchSelectInput options={filteredEducationalInstitution.map((value: ClassifierListTermType) => ({
                  label: value.name,
                  value: value.id,
                }))}
                />
              </Form.Item>
            }
            <Form.Item label="Vērtība" name="value">
              <Input />
            </Form.Item>
            <Form.Item label="Kods" name="code">
              <Input />
            </Form.Item>
            { classifierId === 'resource_subtype' ?
              <>
                <Form.Item label="Resursa veids" name="resource_type">
                  <SearchSelectInput
                    options={
                      resourceTypes.map((value: ClassifierResponse) => (
                        { value: value.code, label: value.value }
                      ))
                    }
                  />
                </Form.Item>
                <ClassifierPayload
                  setPayload={setPayload}
                  payload={payload}
                />
              </>
            :
              <Form.Item label="Papildus parametri" name="payload" rules={[
                {
                  validator: validateJson,
                }
              ]}>
                <Input />
              </Form.Item>
            }
            <Form.Item name="isDisabled" valuePropName="checked">
              <Checkbox>Neaktīvs</Checkbox>
            </Form.Item>
          </Form>
        </Modal>
      }
    </div>
  );
};

export { ClassifierTerms };
