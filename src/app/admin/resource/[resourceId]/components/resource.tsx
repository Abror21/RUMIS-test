'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

import {Button, Spin, Form, Typography, Select, Checkbox, Badge, Input} from "antd";
import type { SelectProps } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import useQueryApiClient from "@/app/utils/useQueryApiClient";

import {Resource as ResourceType} from '@/app/types/Resource';
import {ClassifierTermType} from "@/app/admin/classifiers/components/classifierTerms";
import { goToUrl } from "@/app/utils/utils";
import {dateApplicationFormat, dateFormat, resourceLocations, resourceStatuses} from "@/app/utils/AppConfig";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import LinkButton from "@/app/components/LinkButton";
import ResourceParametersCopyModal from "./ResourceParametersCopyModal";
import dayjs from "dayjs";
import DeleteResourcesModal from "@/app/admin/resources/components/DeleteResourcesModal";
import useHandleError, { DEFAULT_ERROR_MESSAGE } from "@/app/utils/useHandleError";

const { Title } = Typography;
const { TextArea } = Input;

type ResourceProps = {
  resourceId: string;
  initialData: ResourceType;
}
const Resource = ({ resourceId, initialData }: ResourceProps) => {
    const [data, setData] = useState<ResourceType | null>(initialData);
    const [classifiers, setClassifiers] = useState<any>();
    const [statusChangeIsOpen, setStatusChangeIsOpen] = useState<boolean>(false)
    const [resourceParameterCopyModalIsOpen, setResourceParameterCopyModalIsOpen] = useState<boolean>(false)
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false)

    const [form] = Form.useForm();

    const router = useRouter();

    const [handleError] = useHandleError()

    const {
        isLoading,
        appendData: refetch
    } = useQueryApiClient({
        request: {
            url: `/resources/${resourceId}`,
            disableOnMount: true
        },
        onSuccess: (response: ResourceType) => {
            setData(response)
            form.setFieldsValue({
              resourceStatusId: response?.resourceStatus?.id,
              resourceLocationId: response?.resourceLocation?.id,
            })
        },
        onError: () => {
          goToUrl('/admin/resources', router)
        }
    });

    useQueryApiClient({
        request: {
            url: '/classifiers/getByType',
            method: 'GET',
            data: {
                types: [
                    'resource_status',
                    'resource_location'
                ],
                includeDisabled: false
            },
            enableOnMount: true,
        },
        onSuccess: (response) => {
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

    const { appendData: updateResource } = useQueryApiClient({
        request: {
            url: `/resources/${resourceId}`,
            method: 'PUT',
            data: {},
            disableOnMount: true
        },
        onSuccess: () => {
            refetch();
            form.resetFields();
            setStatusChangeIsOpen(false)
        }
    });

    const {
      appendData: deleteResources
    } = useQueryApiClient({
      request: {
        url: `/resources`,
        method: 'DELETE',
        data: {},
        disableOnMount: true
      },
      onSuccess: () => {
        setDeleteModalIsOpen(false)
        goToUrl('/admin/resources', router)
      },
      handleDefaultError: false,
      onError: (error: any) => {
        if (error.message === "application.statusChangeForbidden"){
          handleError({ error: 'Nav atļauts izdzēst vienu/vairākus pieteikumus' })
        } else {
          handleError({ error: DEFAULT_ERROR_MESSAGE })
        }
      }
    });

    const onCheckboxChange = (e: CheckboxChangeEvent) => {
    };

    const handleResourceUpdate = () => {
        let postData: any = {
            resourceNumber: data?.resourceNumber,
            resourceName: data?.resourceName,
            modelIdentifier: data?.modelIdentifier,
            acquisitionsValue: data?.acquisitionsValue,
            manufactureYear: data?.manufactureYear,
            inventoryNumber: data?.inventoryNumber,
            serialNumber: data?.serialNumber,
            notes: data?.notes,
            educationalInstitutionId: data?.educationalInstitution?.id,
            resourceSubTypeId: data?.resourceSubType?.id,
            resourceGroupId: data?.resourceGroup?.id,
            targetGroupId: data?.targetGroup?.id,
            usagePurposeTypeId: data?.usagePurposeType?.id,
            acquisitionTypeId: data?.acquisitionType?.id,
            manufacturerId: data?.manufacturer?.id,
            modelNameId: data?.modelName?.id,
            resourceStatusId: form.getFieldValue('resourceStatusId'),
            resourceLocationId: form.getFieldValue('resourceLocationId'),
        }

        updateResource(postData);
    }

    return (
        <>
            <Spin spinning={isLoading}>
                <Form form={form} initialValues={{resourceStatusId: data?.resourceStatus?.id, resourceLocationId: data?.resourceLocation?.id}}>
                    {data &&
                        <>
                        <div className="w-full 2xl:w-3/4">
                            {/*The whole table*/}
                            <div className="w-full grid grid-cols-2 gap-6">
                              {/*Left*/}
                              <div className="flex flex-col gap-y-6">
                                {/* Resource status */}
                                <div className="w-full bg-white rounded-lg p-6 flex justify-between">
                                  {statusChangeIsOpen ?
                                    <>
                                      <Form.Item name="resourceStatusId" style={{marginBottom: 0}}>
                                        <Select
                                          placeholder="Mainīt statusu"
                                          style={{width: 250}}
                                          options={classifiers && classifiers['resource_status'].map((item: {value: string; label: string;}) => (
                                              {value: item?.value, label: item?.label}
                                          ))}
                                        />
                                      </Form.Item>
                                      <Form.Item name="resourceLocationId" style={{marginBottom: 0}}>
                                        <Select
                                          placeholder="Mainīt atrāšanas vietu"
                                          style={{width: 250}}
                                          options={classifiers && classifiers['resource_location'].map((item: {value: string; label: string;}) => (
                                              {value: item?.value, label: item?.label}
                                          ))}
                                        />
                                      </Form.Item>
                                    </>
                                    :
                                    <div className="flex flex-col">
                                        <Badge color={resourceStatuses.find(el => el.code === data?.resourceStatus?.code)?.color} text={data?.resourceStatus?.value}/>
                                        <Badge color={resourceLocations.find(el => el.code === data?.resourceLocation?.code)?.color} text={data?.resourceLocation?.value}/>
                                    </div>
                                  }
                                  {statusChangeIsOpen ? 
                                    <Button type="primary" onClick={() => {handleResourceUpdate()}}>
                                      Saglabāt
                                    </Button>
                                  :
                                    <Button type="primary" onClick={() => setStatusChangeIsOpen(true)}>
                                      Mainīt
                                    </Button>
                                  }
                                </div>

                                {/* Main data START */}
                                <div className="bg-white rounded-lg p-6">
                                  {/* Pamatdati */}
                                    <div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Veids</b>
                                        </div>
                                        <div>Dators</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Paveids</b>
                                        </div>
                                        <div>{data?.resourceSubType?.value}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Ražotājs</b>
                                        </div>
                                        <div>{data?.manufacturer?.value}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Modelis</b>
                                        </div>
                                        <div>{data?.modelIdentifier}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Seriālais numurs</b>
                                        </div>
                                        <div>{data?.serialNumber}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Inventāra Nr.</b>
                                        </div>
                                        <div>{data?.inventoryNumber}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Ražošanas gads</b>
                                        </div>
                                        <div>{data?.manufactureYear}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Iestādes piešķirtais nosaukums</b>
                                        </div>
                                        <div>{data?.resourceName}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3">
                                        <div>
                                          <b>Resursu grupa</b>
                                        </div>
                                        <div>{data?.resourceGroup?.value}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3">
                                        <div>
                                          <b>Resursa reģistrācijas datums</b>
                                        </div>
                                        <div>{data?.created && dayjs(data?.created).format(dateFormat)}</div>
                                      </div>
                                    </div>

                                  {/* Tehniskie parametri */}
                                  <div className="mt-6">
                                    <Title level={3}>Tehniskie parametri</Title>
                                    {data.resourceParameters.map(param => (
                                      <div key={param.id} className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>{param.parameter.value}</b>
                                        </div>
                                        <div>{param.value}</div>
                                      </div>
                                    ))}
                                    
                                  </div>

                                </div> {/* Main data END */}
                              </div>

                              {/*Right*/}
                              <div className="flex flex-col gap-y-6">
                                {/* Action buttons */}
                                <div className="w-full bg-white rounded-lg p-6 flex justify-between">
                                  <div className="flex justify-start gap-2">
                                    <LinkButton href={`/admin/resource/${resourceId}/edit`} type="primary">
                                      Labot
                                    </LinkButton>
                                    <LinkButton href={`/admin/resource/${resourceId}/copy`} key="copy" htmlType="submit">
                                      Kopēt
                                    </LinkButton>
                                    <Button onClick={() => setResourceParameterCopyModalIsOpen(true)}>
                                      Parametru aizpilde
                                    </Button>
                                    {resourceParameterCopyModalIsOpen && 
                                      <ResourceParametersCopyModal
                                        resource={data}
                                        setModalOpen={setResourceParameterCopyModalIsOpen}
                                      />
                                    }
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="opacity-[45%]">Izveidots: 12.09.2023.</div>
                                    <div className="flex gap-2">
                                      <Button key="history">
                                        Vēsture
                                      </Button>
                                      <Button key="delete" onClick={() => setDeleteModalIsOpen(true)}>
                                        Dzēst
                                      </Button>
                                      {deleteModalIsOpen &&
                                        <DeleteResourcesModal
                                          setModalOpen={setDeleteModalIsOpen}
                                          ids={[resourceId]}
                                          isLoading={false}
                                          submitAction={(notifyContactPersons: boolean, applicationIds: string[]) => {
                                              deleteResources(applicationIds, {notifyContactPersons: notifyContactPersons})
                                          }
                                          }
                                      />
                                      }
                                    </div>
                                  </div>
                                </div>

                                {/* Iegādes dati */}
                                <div className="bg-white rounded-lg p-6">
                                  <Title level={3}>Iegādes dati</Title>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Vadošā iestāde</b>
                                    </div>
                                    <div>Rīgas Valstspilsēta</div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Izglītības iestāde</b>
                                    </div>
                                    <div>{data?.educationalInstitution?.name}</div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Iegādes veids</b>
                                    </div>
                                    <div>{data?.acquisitionType?.value}</div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Sociālā atbalsta resurss</b>
                                    </div>
                                    <div>
                                      {data?.socialSupportResource === true && <CheckOutlined />}
                                      {data?.socialSupportResource === false && <CloseOutlined />}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Izmantošanas mērķis</b>
                                    </div>
                                    <div>{data?.usagePurposeType?.value}</div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                    <div>
                                      <b>Mērķa grupa</b>
                                    </div>
                                    <div>{data?.targetGroup?.value}</div>
                                  </div>
                                  <div className="grid grid-cols-[0.8fr,1.2fr] py-3">
                                    <div>
                                      <b>Iegādes vērtība (ar PVN)</b>
                                    </div>
                                    <div>{data.acquisitionsValue ? `${data.acquisitionsValue} €` : null}</div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-6">
                                  <Title level={3} >Piezīmes</Title>
                                  <div className="py-3 border-t border-gray">{data?.notes}</div>
                                  <div className="my-10">
                                    <Form.Item>
                                    <TextArea rows={4} placeholder="Papildus piezīmes"/>
                                  </Form.Item>
                                  </div>
                                  <Button key="save" type="primary" disabled>
                                    Saglabāt
                                  </Button>
                                </div>

                              </div>
                            </div>
                        </div>
                        </>
                    }
                </Form>
            </Spin>
        </>
    );
};

export { Resource };
