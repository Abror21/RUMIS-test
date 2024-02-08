'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Space,
  Form,
  Input,
  Spin,
  InputNumber,
  Typography,
  Checkbox,
} from 'antd';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import type { SelectProps } from 'antd';
import React, { startTransition, useEffect, useState } from 'react';
import { ClassifierTermType } from '@/app/admin/classifiers/components/classifierTerms';
import SearchSelectInput from '@/app/components/searchSelectInput';
import { ClassifierResponse } from '@/app/types/Classifiers';
import { goToUrl } from '@/app/utils/utils';
import LinkButton from '@/app/components/LinkButton';
import { Resource } from '@/app/types/Resource';

const { TextArea } = Input;

interface InstitutionItem {
  code: string;
  id: number;
  name: string;
  status: { code: 'string'; id: string; value: string };
  supervisor: { id: number; code: string; name: string }
}
const { Title } = Typography

type EditAddResourceFormProps = {
  isAddForm: boolean;
  initialData?: Resource
}

export type ResourceParameter = {
  resource_type: string;
  groups: {
    id: string;
    isRequired: boolean,
    type: string;
    value: string;
    parameters?: {
      id: string;
      isRequired: boolean,
      type: string;
      value: string;
    }[]

  }[]
}

const EditAddResourceForm = ({isAddForm, initialData}: EditAddResourceFormProps) => {
  const [parameters, setParameters] = useState<ResourceParameter | null>(null)

  const [form] = Form.useForm();
  const [classifiers, setClassifiers] = useState<any>();
  const router = useRouter();
  const searchParams = useSearchParams()

  const institutionId: string = searchParams.get('educationalInstitutionId') as string;
  const resourceTypeId: string = searchParams.get('resourceTypeId') as string;
  const resourceSubTypeId: string = searchParams.get('resourceSubTypeId') as string;

  useEffect(() => {
    if (isAddForm && !initialData) {
      if (!institutionId || !resourceTypeId || !resourceSubTypeId) {
        goToUrl('/admin/resources', router)
      }
    } else {
      const parameters = initialData?.resourceParameters.reduce((acc, param) => {
        // @ts-ignore
        acc[param.parameter.id] = param.value;
        return acc;
      }, {});
      
      form.setFieldsValue({
        ...initialData,
        manufacturerId: initialData?.manufacturer?.id,
        modelNameId: initialData?.modelName?.id,
        resourceGroupId: initialData?.resourceGroup?.id,
        resourceStatusId: initialData?.resourceStatus?.id,
        acquisitionTypeId: initialData?.acquisitionType?.id,
        usagePurposeTypeId: initialData?.usagePurposeType?.id,
        targetGroupId: initialData?.targetGroup?.id,
        resourceLocationId: initialData?.resourceLocation?.id,
        parameters: parameters,
        notes: !isAddForm ? initialData?.notes : null,
        serialNumber: (isAddForm && initialData) ? null : initialData?.serialNumber,
        inventoryNumber: (isAddForm && initialData) ? null : initialData?.inventoryNumber
      })
    }
  }, [])

  const { isLoading: classifierLoading } = useQueryApiClient({
    request: {
      url: '/classifiers/getByType',
      method: 'GET',
      data: {
        types: [
          'resource_type',
          'resource_subtype',
          'resource_group',
          'resource_status',
          'resource_location',
          'target_group',
          'resource_using_purpose',
          'resource_acquisition_type',
          'resource_manufacturer',
          'resource_model_name',
          'resource_parameter'
        ],
        includeDisabled: false
      },
      enableOnMount: true,
    },
    onSuccess: (response: ClassifierResponse[]) => {
      if (response.length > 0) {
          const resourceType = (isAddForm && !initialData) ? 
            response.find((type: ClassifierResponse) => type.id === resourceTypeId)?.value 
            : 'Dators'
          const resourceSubtype = (isAddForm && !initialData) ? 
            response.find((el: ClassifierResponse) => el.id === resourceSubTypeId)
            : response.find((el: ClassifierResponse) => el.id === initialData?.resourceSubType?.id)

          if (!resourceType || !resourceSubtype) {
            goToUrl('/admin/resources', router)
            return
          }

          const resourceParameters = response.filter(classifier => classifier.type === 'resource_parameter')
          const parameters: ResourceParameter | null = resourceSubtype.payload ? JSON.parse(resourceSubtype.payload as string) : null
          
          setParameters(parameters)

          form.setFieldsValue({
            resourceType: resourceType,
            resourceSubtype: resourceSubtype.value,
          })
      }

      //@ts-ignore
      const group = response.reduce((result: SelectProps, item: ClassifierTermType) => ({
        ...result,
        [item['type']]: [
          //@ts-ignore
          ...(result[item['type']] || []),
          {
            label: item.value,
            value: item.id,
          },
        ],
      }),
        {},
      );

      setClassifiers(group)
    },
  });

  const {isLoading: institutionLoading} = useQueryApiClient({
    request: {
      url: '/educationalInstitutions',
    },
    onSuccess: (response) => {
      if (response.length > 0) {
        const institution: InstitutionItem = (isAddForm && !initialData) ?
          response.find((el: InstitutionItem) => el.id === Number(institutionId))
          : response.find((el: InstitutionItem) => el.id === Number(initialData?.educationalInstitution?.id))

        if (institution) {
          form.setFieldsValue({
            educationalInstitutionId: institution.name,
            supervisorId: institution?.supervisor?.name
          })
        } else {
          goToUrl('/admin/resources', router)
          return
        }
      }
    }
  });

  const { appendData, isLoading } = useQueryApiClient({
    request: {
      url: '/resources',
      method: 'POST',
    },
    onSuccess: () => {
      form.resetFields();
      goToUrl('/admin/resources', router);
    },
  });

  const { appendData: updateResourceData } = useQueryApiClient({
    request: {
      url: '/resources/:id',
      method: 'PUT',
    },
    onSuccess: () => {
      form.resetFields();
      startTransition(() => {
        router.refresh();
        goToUrl('/admin/resources', router);
      })
    },
  });
  
  const createResource = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations

    if (!initialData) {
      values.educationalInstitutionId = Number(institutionId);
      values.resourceSubTypeId = resourceSubTypeId;
    } else {
      values.educationalInstitutionId = initialData?.educationalInstitution?.id;
      values.resourceSubTypeId = initialData?.resourceSubType?.id;
    }

    if (values.parameters) {
      values.resourceParameters = Object.keys(values.parameters).map((parameterId) => ({
        parameterId,
        value: values.parameters[parameterId],
      }));
    }

    delete values.supervisorId;
    delete values.resourceSubtype;
    delete values.resourceType;
    delete values.parameters;

    appendData(values);
  };

  const updateResource = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    values.educationalInstitutionId = initialData?.educationalInstitution?.id
    values.resourceSubTypeId = initialData?.resourceSubType?.id

    const newResourceParameters = Object.keys(values.parameters).map((parameterId) => ({
      parameterId,
      value: values.parameters[parameterId],
      id: values.resourceParameters.find((p: any) => p.parameter.id === parameterId)?.id ?? null
    }));

    values.resourceParameters = newResourceParameters

    delete values.supervisorId;
    delete values.resourceSubtype;
    delete values.resourceType;
    delete values.socialSupportResource;
    delete values.parameters;

    updateResourceData(values, {id: initialData?.id});
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <Spin spinning={isLoading || classifierLoading || institutionLoading}>
          <Form
            form={form}
            layout="vertical"
            className='flex flex-row w-11/12 gap-6'
          >

            <div className='w-1/2 flex flex-col bg-white rounded p-6'>
              <Title level={4}>Pamatdati</Title>
              <div>
                <Form.Item
                  className='border-b'
                  label="Veids"
                  name="resourceType"
                  rules={[{ required: true }]}
                >
                  <Input readOnly bordered={false} />
                </Form.Item>
                <Form.Item
                className='border-b'
                  label="Paveids"
                  name="resourceSubtype"
                  rules={[{ required: true }]}
                >
                  <Input readOnly bordered={false} />
                </Form.Item>

                <Form.Item
                  label="Resursa nosaukums"
                  name="modelNameId"
                  rules={[{ required: true , message: 'Resursa nosaukums ir obligāts lauks'}]}
                >
                  <SearchSelectInput 
                    placeholder="Asus Chromebook Flip CX3 CX3400FMA-EC0226 1"
                    options={classifiers?.resource_model_name}
                />
                </Form.Item>
                <Form.Item
                  label="Ražotājs"
                  name="manufacturerId"
                  rules={[{ required: true , message: 'Ražotājs ir obligāts lauks'}]}
                >
                  <SearchSelectInput
                    options={classifiers?.resource_manufacturer}
                    placeholder="Ražotājs"
                  />
                </Form.Item>
                <Form.Item
                  name="modelIdentifier"
                  label="Modelis"
                  rules={[
                    { max: 100, message: 'Maksimālais simbolus skaits - 100' }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Sērijas numurs"
                  name="serialNumber"
                  rules={[
                    { required: true , message: 'Sērijas numurs ir obligāts lauks'},
                    { max: 100, message: 'Maksimālais simbolus skaits - 100' }
                  ]}
                >
                  <Input placeholder='Sērijas numurs' />
                </Form.Item>
                <Form.Item
                  label="Inventāra Nr."
                  name="inventoryNumber"
                  rules={[
                    { required: true , message: 'Sērijas numurs ir obligāts lauks'},
                    { max: 100, message: 'Maksimālais simbolus skaits - 100' }
                  ]}
                >
                  <Input placeholder='Inventāra Nr' />
                </Form.Item>
                <Form.Item
                  label="Ražošanas gads"
                  name="manufactureYear"
                  rules={[{ required: true , message: 'Ražošanas gads ir obligāts lauks'}]}
                >
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  label="Iestādes piešķirtais nosaukums"
                  name="resourceName"
                  rules={[
                    { max: 100, message: 'Maksimālais simbolus skaits - 100' }
                  ]}
                >
                  <Input placeholder='Iestādes piešķirtais nosaukums' />
                </Form.Item>
                <Form.Item
                  label="Resursu grupa"
                  name="resourceGroupId"
                >
                  <SearchSelectInput
                    options={classifiers?.resource_group}
                    placeholder='Resursu grupa'
                  />
                </Form.Item>
                <Form.Item
                  name="resourceStatusId"
                  label="Statuss"
                  rules={[{ required: true , message: 'Statuss ir obligāts lauks'}]}
                >
                  <SearchSelectInput
                    options={classifiers?.resource_status}
                  />
                </Form.Item>
              </div>
              {parameters &&
                <>
                  <Title level={4}>Tehniskie parametri</Title>
                  <div>
                    {parameters.groups.map(group => (
                      <React.Fragment key={group?.id}>
                        <div><b>{group?.value}</b></div>
                        {group.parameters &&
                          group.parameters.map(param => (
                            <Form.Item
                              key={param?.id}
                              name={['parameters', param.id]}
                              label={param?.value}
                            >
                              <Input />
                            </Form.Item>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </div>
                </>
              }
            </div>

            <div className='w-1/2 flex flex-col bg-white rounded p-6'>
                <Title level={4}>Iegādes dati</Title>
                <div>
                  <Form.Item
                    className='border-b'
                    label="Vadošā iestāde"
                    name="supervisorId"
                  >
                    <Input readOnly bordered={false} />
                  </Form.Item>
                  <Form.Item
                    className='border-b'
                    label="Izglītības iestāde"
                    name="educationalInstitutionId"
                    rules={[{ required: true , message: 'Izglītības iestāde ir obligāts lauks'}]}
                  >
                    <Input readOnly bordered={false} />
                  </Form.Item>
                  <Form.Item
                    label="Iegādes veids"
                    name="acquisitionTypeId"
                    rules={[{ required: true , message: 'Iegādes veids ir obligāts lauks'}]}
                  >
                    <SearchSelectInput
                      placeholder="Pašvaldības finansējums"
                      options={classifiers?.resource_acquisition_type}
                    />
                  </Form.Item>
                  <Form.Item
                    valuePropName='checked'
                    label="Sociālā atbalsta resurss"
                    name="socialSupportResource"
                  >
                    <Checkbox />
                  </Form.Item>

                  <Form.Item
                    label="Izmantošanas mērķis"
                    name="usagePurposeTypeId"
                    rules={[{ required: true , message: 'Izmantošanas mēŗkis ir obligāts lauks'}]}
                  >
                    <SearchSelectInput
                      options={classifiers?.resource_using_purpose}
                      placeholder="Izsniegšanai individuāli"
                    />
                  </Form.Item>
                  <Form.Item
                    name="targetGroupId"
                    label="Mērķa grupa"
                    rules={[{ required: true , message: 'Mērķa grupa ir obligāts lauks'}]}
                  >
                    <SearchSelectInput
                      placeholder="Sociāli mazāk aizsargātām grupām"
                      options={classifiers?.target_group}
                    />
                  </Form.Item>
                  <Form.Item
                    name="resourceLocationId"
                    label="Atrašanās vieta"
                    rules={[{ required: true , message: 'Atrašanas vieta ir obligāts lauks'}]}
                  >
                    <SearchSelectInput
                      placeholder="Resursa atrašanās vieta"
                      options={classifiers?.resource_location}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Iegādes vērtība (ar PVN)"
                    name="acquisitionsValue"
                    rules={[{ required: true , message: 'Iegādes vērtība (ar PVN) ir obligāts lauks'}]}
                  >
                    <InputNumber style={{ width: '100%' }}  />
                  </Form.Item>
                </div>
                <div>
                  <Title level={4}>Piezīmes</Title>
                  <Form.Item
                    name="notes"
                    label=""
                    rules={[
                      { max: 1000, message: 'Maksimālais simbolus skaits - 1000' }
                    ]}
                  >
                    <TextArea rows={5} />
                  </Form.Item>
                </div>
            </div>

          </Form>
        <Space className='w-full flex justify-between mt-2'>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              onClick={isAddForm ? () => createResource() : () => updateResource()}
              disabled={isLoading}
            >
              Saglabāt
            </Button>
            <LinkButton
              htmlType="button"
              href={'/admin/resources'}
            >
              Atcelt
            </LinkButton>
          </Space>
        </Space>
      </Spin>
    </div>
  );
};

export { EditAddResourceForm };
