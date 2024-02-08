'use client';

import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { Button, Spin, Modal, Form, Input, Typography} from "antd";
import { useRouter } from 'next/navigation';
import { Application as ApplicationType } from '@/app/types/Applications';
import dayjs from "dayjs";
import { dateApplicationFormat } from "@/app/utils/AppConfig";
import { useEffect, useMemo, useState } from "react";
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import { APPLICANT_STATUS_SUBMITTED, CONTACT_TYPE_EMAIL, CONTACT_TYPE_PHONE_NUMBER, APPLICANT_STATUS_DELETED, PNA_STATUS_ISSUED, PNA_STATUS_RETURNED, PNA_STATUS_STOLEN, PNA_STATUS_LOST, PNA_STATUS_CANCELLED, APPLICANT_STATUS_CONFIRMED, APPLICANT_STATUS_POSTPONED } from "../new/components/applicantConstants";
import DeleteApplicationModal from "../../applications/components/DeleteApplicationModal";
import RejectApplicationModal from "../../applications/components/RejectApplicationModal";
import { Person } from "@/app/types/Persons";
import Link from "next/link";
import LinkButton from "@/app/components/LinkButton";
import { goToUrl } from "@/app/utils/utils";
import useHandleError from "@/app/utils/useHandleError";

const { confirm } = Modal;

const { Title } = Typography;

type ApplicationProps = {
  applicationId: string;
  initialData: ApplicationType,
  initialSocialStatus: boolean | undefined
}

const Application = ({ applicationId, initialData, initialSocialStatus }: ApplicationProps) => {
  const [typedData, setTypedData] = useState<ApplicationType | null>(initialData)
  const [socialStatus, setSocialStatus] = useState<boolean | undefined | null>(initialSocialStatus);
  const [editContactModalOpen, setEditContactModalOpen] = useState<boolean>(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false);
  const [rejectedModalIsOpen, setRejectedModalIsOpen] = useState<boolean>(false);
  // const [contactPersonInfo, setContactPersonInfo] = useState<Person | null>(null);
  const [form] = Form.useForm();
  const [handleError] = useHandleError();

  const privatePersonalIdentifier = Form.useWatch('privatePersonalIdentifier', form)

  const submitButtons = useMemo(() => {
    if (privatePersonalIdentifier === typedData?.contactPerson?.person[0].privatePersonalIdentifier) {
      return (
        <Button  htmlType="submit" type="primary">
          Saglabāt
        </Button>
      )
    } else {
      return (
        <>
          <Button htmlType="button" type="primary" onClick={() => {
            handleContactSubmit(form.getFieldsValue(), true)
          }}>
            Jā, visos
          </Button>
          <Button  htmlType="submit" type="primary">
            Nē, tikai šajā
          </Button>
        </>
      )
    }
  }, [privatePersonalIdentifier])

  const router = useRouter();

  useEffect(() => {
    if (typedData) {
      getContactPerson([], {privatePersonalIdentifier: typedData?.contactPerson?.person[0].privatePersonalIdentifier})
    }
  }, [typedData])

  const {
    isLoading,
    appendData: refetch
  } = useQueryApiClient({
    request: {
      url: `/applications/${applicationId}`,
      disableOnMount: true
    },
    onSuccess: (response: ApplicationType) => {
      setTypedData(response)
      setSocialStatus(response.socialStatusApproved)
    },
    onError: () => {
      goToUrl('/admin/applications', router)
    }
  });

  const handleCancel = () => {
    setEditContactModalOpen(false);
  };

  const { refetch: checkSocialStatus } = useQueryApiClient({
    request: {
      url: `applications/${applicationId}/applicationsocialstatus`,
      method: 'GET',
      disableOnMount: true
    },
    onSuccess: (response: ApplicationType) => {
      setSocialStatus(response.socialStatusApproved);
      if (response.socialStatusApproved === null) {
        handleError({ error: 'Atbilde nav saņemta' })
      }
    },
  });

  const { appendData: postponeApplication } = useQueryApiClient({
    request: {
      url: `/applications/postpone/:applicationId`,
      method: 'PUT',
    },
    onSuccess: () => {
      goToUrl('/admin/applications', router)
    },
  });

  const { data: contactPersonInfo, appendData: getContactPerson } = useQueryApiClient({
    request: {
      url: `/persons/:privatePersonalIdentifier`,
      method: 'GET',
      disableOnMount: true
    },
  });

  const handleContactEdit = () => {
    form.setFieldValue('firstName', contactPersonInfo.firstName);
    form.setFieldValue('lastName', contactPersonInfo.lastName);
    form.setFieldValue('privatePersonalIdentifier', contactPersonInfo.privatePersonalIdentifier);

    const { contactInformation } = contactPersonInfo
    const emailField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_EMAIL)
    const phoneField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_PHONE_NUMBER)

    if (emailField) {
      form.setFieldValue('email', emailField.value);
    }
    if (phoneField) {
      form.setFieldValue('phoneNumber', phoneField.value);
    }

    setEditContactModalOpen(true);
  }

  const contactInfo = useMemo(() => {
    if (!contactPersonInfo || Array.isArray(contactPersonInfo)) return null

    const { contactInformation } = contactPersonInfo

    const emailField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_EMAIL)
    const phoneField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_PHONE_NUMBER)
    if (phoneField && emailField) {
      return (
        <>
          <p>{phoneField.value}</p>
          <p>{emailField.value}</p>
        </>
      )
    } else if (phoneField) {
      return phoneField.value
    } else if (emailField) {
      return emailField.value
    } else {
      return null
    }

  }, [contactPersonInfo])

  const showAddPnaButton: boolean = useMemo(() => {
    if (typedData?.applicationResources && !typedData?.applicationResources?.every(res => [PNA_STATUS_RETURNED, PNA_STATUS_STOLEN, PNA_STATUS_LOST, PNA_STATUS_CANCELLED].includes(res.pnaStatus.id))) {
      return false;
    }

    if (![APPLICANT_STATUS_SUBMITTED, APPLICANT_STATUS_POSTPONED, APPLICANT_STATUS_CONFIRMED].includes(typedData?.applicationStatus.id as string)) {
      return false
    }

    if (typedData?.applicationResources && typedData.applicationResources.length === 0) {
      return true
    }


    return true
  }, [typedData])

  const {
    appendData: deleteApplication
  } = useQueryApiClient({
    request: {
      url: `/applications/:notifyContactPersons`,
      method: 'DELETE',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      goToUrl('/admin/applications', router)
    }
  });

  const {
    appendData: rejectApplication
  } = useQueryApiClient({
    request: {
      url: `/applications/decline/:notifyContactPersons`,
      method: 'PUT',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      goToUrl('/admin/applications', router)
    }
  });

  const {
    appendData: submitContact
  } = useQueryApiClient({
    request: {
      url: `/applications/${applicationId}/becomeContact`,
      method: 'PUT',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      refetch()
      setEditContactModalOpen(false)
    }
  });

  const {
    appendData: submitContactForAll
  } = useQueryApiClient({
    request: {
      url: `/applications/becomeContact`,
      method: 'PUT',
      data: {},
      disableOnMount: true
    },
    onSuccess: () => {
      refetch()
      setEditContactModalOpen(false)
    }
  });

  const handleContactSubmit = (values: any, toAll: boolean = false) => {
    const { firstName, lastName, privatePersonalIdentifier, email, phoneNumber } = values
    const data: any = {
      firstName,
      lastName,
      privatePersonalIdentifier,
      applicationContactInformation: [],
    };

    if (values.email) {
      data.applicationContactInformation.push({
        typeId: CONTACT_TYPE_EMAIL,
        value: email,
      });
    }

    if (values.phoneNumber) {
      data.applicationContactInformation.push({
        typeId: CONTACT_TYPE_PHONE_NUMBER,
        value: phoneNumber
      });
    }

    if (toAll) {
      submitContactForAll({
        resourceTargetPersonId: typedData?.resourceTargetPerson.id,
        contactPerson: data
      })
    } else {
      submitContact(data)
    }
  }

  const monitoringClassParallel = useMemo(() => {
    if (!typedData?.monitoringClassGrade || !typedData?.monitoringClassParallel) return null

    if (
      typedData?.resourceTargetPersonClassGrade !== typedData?.monitoringClassGrade ||
      typedData?.resourceTargetPersonClassParallel !== typedData?.monitoringClassParallel 
    ) {
      return `${typedData?.monitoringClassGrade}${typedData?.monitoringClassParallel}`
    }
    

    return null
    
  }, [typedData])

  const monitoringEducationalStatus = useMemo(() => {
    if (!typedData?.monitoringEducationalStatus && !typedData?.monitoringWorkStatus) return null

    if (typedData?.resourceTargetPersonEducationalStatus?.code !== typedData?.monitoringEducationalStatus?.code) {
      return `${typedData?.monitoringEducationalStatus?.value}`
    
    }
    if (typedData?.resourceTargetPersonWorkStatus?.code !== typedData?.monitoringWorkStatus?.code) {
      return `${typedData?.monitoringWorkStatus?.value}`
    }

    return null
    
  }, [typedData])

  const monitoringEducationalSubStatus = useMemo(() => {
    if (!typedData?.monitoringEducationalSubStatus) return null

    if (typedData?.resourceTargetPersonEducationalSubStatus?.code !== typedData?.monitoringEducationalSubStatus?.code) {
      return `${typedData?.monitoringEducationalSubStatus?.value}`
    
    }

    return null
    
  }, [typedData])
  return (
    <div>
      <Spin spinning={isLoading}>
        {typedData &&
          <div className="max-w-[1392px]">
            <div className="flex justify-end pb-2"><LinkButton href="/admin/applications">Uz sarakstu</LinkButton></div>
            <div className="flex gap-6 ">
              <div className="w-3/5 bg-white rounded-lg p-6">
                <div className="grid grid-cols-5 gap-6 p-3 ps-0 border-b">
                  <div className="font-medium col-span-2">
                    Pieteikuma datums, laiks
                  </div>
                  <div className="col-span-3">{typedData?.applicationDate && dayjs(typedData.applicationDate).format(dateApplicationFormat)}</div>
                </div>
                <div className="grid grid-cols-5 gap-6 p-3 ps-0 border-b">
                  <div className="font-semibold col-span-2">
                    Pieteikuma statuss
                  </div>
                  <div className="col-span-3">
                    {typedData?.applicationStatus?.value}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-6 p-3 ps-0 border-b">
                  <div className="font-semibold col-span-2">
                    Resursa paveids
                  </div>
                  <div className="col-span-3">{typedData?.resourceSubType?.value}</div>
                </div>
                <div className="grid grid-cols-5 gap-6 p-3 ps-0 border-b">
                  <div className="font-semibold col-span-2">
                    Resursa lietotājs
                  </div>
                  <div className="font-semibold col-span-3">{`${typedData?.resourceTargetPerson?.person[0].firstName} ${typedData?.resourceTargetPerson?.person[0].lastName} (${typedData?.resourceTargetPerson?.person[0].privatePersonalIdentifier})`}</div>
                </div>
                <div className="grid grid-cols-5 gap-6 p-3 ps-0">
                  <div className="font-semibold col-span-2">
                    Resursa lietotāja tips
                  </div>
                  <div className="font-semibold col-span-3">{typedData?.resourceTargetPersonType?.value}</div>
                </div>
                <div className="grid grid-cols-5 p-3">
                  <div className="col-span-2">
                  </div>
                  <div className="col-span-3">
                    {`${typedData?.resourceTargetPersonClassGrade}${typedData?.resourceTargetPersonClassParallel}`}
                    {monitoringClassParallel &&
                      <>
                        &nbsp;/
                        <span className="text-red"> {monitoringClassParallel}</span>
                      </>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-5 p-3">
                  <div className="col-span-2">
                  </div>
                  <div className="col-span-3">{`${typedData?.resourceTargetPersonEducationalProgram}`}</div>
                </div>
                <div className="grid grid-cols-5 p-3 border-b">
                  <div className="col-span-2">
                  </div>
                  <div className="col-span-3">{typedData?.educationalInstitution?.name}</div>
                </div>
                <div className="grid grid-cols-5 gap-6 p-3 ps-0">
                  <div className="font-semibold col-span-2">
                    Resursa lietotāja statuss
                  </div>
                  <div className="col-span-3">
                    {typedData?.resourceTargetPersonEducationalStatus?.value ?? typedData?.resourceTargetPersonWorkStatus?.value}
                    {monitoringEducationalStatus &&
                      <>
                        &nbsp;/
                        <span className="text-red"> {monitoringEducationalStatus}</span>
                      </>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-5 p-3 border-b">
                  <div className="col-span-2">
                  </div>
                  <div className="col-span-3">
                    {typedData?.resourceTargetPersonEducationalSubStatus?.value}
                    {monitoringEducationalSubStatus &&
                      <>
                        &nbsp;/
                        <span className="text-red"> {monitoringEducationalSubStatus}</span>
                      </>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-5 items-center gap-6 p-3 ps-0 border-b">
                  <div className="font-semibold flex flex-col items-start gap-[10px] col-span-2">
                    Sociālais statuss
                    <Button className="" type="primary" onClick={() => checkSocialStatus()}>
                      Pārbaudīt
                    </Button>
                  </div>
                  <div className="col-span-3">
                    <ul className="list-disc">
                      {
                        typedData?.applicationSocialStatus?.map(status => (
                          <li key={status.id} className="text-gray-400">
                            {socialStatus ?
                              <CheckOutlined className='!text-[#488f31]'/>
                            :
                              <StopOutlined className="!text-red"/>
                            }
                            <span className="text-black pl-2">{status?.socialStatus?.value}</span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-5 p-3 ps-0 border-b">
                  <div className="font-semibold col-span-2">
                    PNA
                  </div>
                  <div className="col-span-3">
                    {(Array.isArray(typedData?.applicationResources) && typedData?.applicationResources.length > 0) &&
                      typedData?.applicationResources.map(pna => (
                        <div key={pna.pnaNumber}>
                          <Link href={`/admin/pnakts/${pna.id}`}>{pna.pnaNumber}</Link>
                          {` (${pna.pnaStatus?.value})`}
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="grid grid-cols-5 p-3 ps-0 border-b">
                  <div className="font-semibold col-span-2">
                    Pieteikuma iesniedzējs
                  </div>
                  <div className="col-span-3">{`${typedData?.submitterPerson?.person[0].firstName} ${typedData?.submitterPerson?.person[0].lastName} (${typedData?.submitterPerson?.person[0].privatePersonalIdentifier})`}</div>
                </div>
                <div className="grid grid-cols-5 p-3 ps-0">
                  <div className="font-semibold col-span-2">
                    Iesniedzēja loma
                  </div>
                  <div className="col-span-3">{typedData?.submitterType?.value}</div>
                </div>
              </div>
              <div className="w-2/5">
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {showAddPnaButton && 
                      <LinkButton key="edit" type="primary" href={`/admin/pnakts/add/${applicationId}`}>
                        Piešķirt resursu
                      </LinkButton>
                    }
                    {typedData?.applicationStatus?.id === APPLICANT_STATUS_SUBMITTED &&
                      <Button key="back" onClick={() => postponeApplication([], { applicationId })}>
                        Atlikt izskatīšanu
                      </Button>
                    }
                    <Button onClick={() => setRejectedModalIsOpen(true)}>
                      Atteikt
                    </Button>
                  </div>
                  <div className="mt-4">
                    {(typedData?.applicationStatus?.id !== APPLICANT_STATUS_DELETED && typedData?.applicationStatus?.id !== APPLICANT_STATUS_CONFIRMED) &&
                      <Button key="delete" danger onClick={() => setDeleteModalIsOpen(true)}>
                        Dzēst
                      </Button>
                    }
                  </div>
                  {deleteModalIsOpen &&
                    <DeleteApplicationModal
                      setModalOpen={setDeleteModalIsOpen}
                      ids={[applicationId]}
                      isLoading={isLoading}
                      submitAction={(notifyContactPersons: boolean, applicationIds: string[]) => {
                        deleteApplication(applicationIds, { notifyContactPersons: notifyContactPersons })
                      }
                      }
                    />
                  }
                  {rejectedModalIsOpen &&
                    <RejectApplicationModal
                      setModalOpen={setRejectedModalIsOpen}
                      ids={[applicationId]}
                      isLoading={isLoading}
                      submitAction={(notifyContactPersons: boolean, rejectReason: string, applicationIds: string[]) => {
                        rejectApplication({
                          applicationIds: applicationIds,
                          reason: rejectReason
                        }, { notifyContactPersons: notifyContactPersons })
                      }
                      }
                    />
                  }
                </div>

                <div className="bg-white rounded-lg mt-6">
                  <div className="flex justify-between items-center py-4 px-6 border-b">
                    <b>Kontaktpersona</b>
                    <Button onClick={() => handleContactEdit()}>
                      Labot
                    </Button>
                  </div>

                  <div className="p-6">
                    <div>
                      {typedData?.contactPerson?.person[0].firstName} {typedData?.contactPerson?.person[0].lastName}
                    </div>
                    <div>
                      {contactInfo}
                    </div>
                  </div>
                </div>

                <Modal
                  title="Kontaktpersona"
                  open={editContactModalOpen}
                  onCancel={handleCancel}
                  footer={null}
                >
                  <Form form={form} layout="vertical" onFinish={handleContactSubmit}>
                    <Form.Item
                      label="Vārds"
                      name="firstName"
                      rules={[{ required: true, message: "Vārds ir obligāts lauks." }]}
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
                    <Form.Item
                      label="Personas kods"
                      name="privatePersonalIdentifier"
                      extra="Ievadīt bez domu zīmes."
                      rules={[{ required: true, pattern: new RegExp(/^\d{11}$/), message: "Atļauts ievadīt tikai 11 ciparus." }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="E-pasta adrese"
                      name="email"
                      rules={[
                        { required: true, message: "E-pasts ir obligāts lauks." },
                        { type: 'email', message: 'Nepareizs e-pasta formāts' }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="phoneNumber"
                      label="Tālrunis"
                      rules={[
                        {
                          pattern: /^[0-9+]*$/i,
                          message: 'Atļautie simboli 0-9, +',
                        },
                        { max: 15 },
                        { required: true, message: "Tālrunis ir obligāts lauks." }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    {privatePersonalIdentifier !== typedData?.contactPerson?.person[0].privatePersonalIdentifier &&
                      <Title level={5}>Vai norādīt Jūs kā kontaktpersonu visos {typedData?.resourceTargetPerson?.person[0].firstName} {typedData?.resourceTargetPerson?.person[0].lastName} pieteikumos?</Title>
                    }
                    <div className="flex justify-end gap-2">
                      <Button  onClick={handleCancel}>
                        Atcelt
                      </Button>
                      {submitButtons}
                    </div>
                  </Form>
                </Modal>
              </div>
            </div>
          </div>
        }
      </Spin>
    </div>
  );
};

export { Application };
