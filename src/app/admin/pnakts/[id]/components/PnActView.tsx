'use client'

import { SelectOption } from "@/app/types/Antd"
import { ClassifierResponse } from "@/app/types/Classifiers"
import {dateFormat, dateRequestFormat, pnaStatuses} from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import {Badge, Button, Col, DatePicker, Form, Input, Row, Select, Spin, Typography} from "antd"
import {FilePdfOutlined} from "@ant-design/icons";
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import MoreResourcesModal from "./MoreResourcesModal"
import { Resource } from "@/app/types/Resource"
import {PnAct as PnActType} from "@/app/types/PnAct"
import Link from "next/link"
import { Application as ApplicationType } from '@/app/types/Applications';
import { CONTACT_TYPE_EMAIL, CONTACT_TYPE_PHONE_NUMBER, PNA_STATUS_ISSUED, PNA_STATUS_PREPARED, PNA_STATUS_PREPARING } from "@/app/admin/application/new/components/applicantConstants"
import { useRouter } from "next/navigation"
import ChangeTermModal from "./ChangeTermModal"
import LostStolenModal from "./LostStolenModal"
import LinkButton from "@/app/components/LinkButton"
import ReturnPnaModal from "./ReturnPnaModal"
import CancelPnaModal from "./CancelPnaModal"

type PnActProps = {
    data: PnActType
}

const { Title } = Typography;

const PnActView = ({data}: PnActProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const [contactInfo, setContactInfo] = useState<null| any>(null);

    const [isChangeTermModalOpen, setIsChangeTermModalOpen] = useState<boolean>(false)
    const [isLostStolenModalOpen, setIsLostStolenModalOpen] = useState<boolean>(false)
    const [isReturnPnaModalOpen, setIsReturnPnaModalOpen] = useState<boolean>(false)
    const [isCancelPnaModalOpen, setIsCancelPnaModalOpen] = useState<boolean>(false)

    const [pnaFile, setPnaFile] = useState<string | null>(null)
    const [exploitationRules, setExploitationRules] = useState<string | null>(null)

    const [form] = Form.useForm();

    const router = useRouter();

    useEffect(() => {
        refetch([], { applicationId: data.application.id })
    }, [data])

    const {
        appendData: refetch,
        data: applicationData
      } = useQueryApiClient({
        request: {
          url: `/applications/:applicationId`,
          disableOnMount: true
        },
        onSuccess: (response: ApplicationType) => {
            getContactPerson([], {privatePersonalIdentifier: response?.contactPerson?.person[0].privatePersonalIdentifier})
        }
    });

    const { data: contactPersonInfo, appendData: getContactPerson } = useQueryApiClient({
        request: {
          url: `/persons/:privatePersonalIdentifier`,
          method: 'GET',
          disableOnMount: true
        },
        onSuccess: (response: any) => {
            if (!response.contactInformation) return null
            const { contactInformation } = response

            const emailField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_EMAIL)
            const phoneField = contactInformation.find((c: any) => c.type.id === CONTACT_TYPE_PHONE_NUMBER)

            if (phoneField && emailField) {
              setContactInfo(`${phoneField.value}; ${emailField.value}`)
            } else if (phoneField) {
                setContactInfo(phoneField.value)
            } else if (emailField) {
                setContactInfo(emailField.value)
            } else {
                setContactInfo(null)
            }
        },
    });

    const {appendData: appendDataAsPrepared} = useQueryApiClient({
        request: {
          url: `/applicationResources/:id/prepared`,
          method: 'PUT',
          disableOnMount: true,
          data: {}
        },
        onSuccess(response) {
            router.refresh()
        }
    })
    const {} = useQueryApiClient({
        request: {
            url: `/applicationResources/${data.id}/pna/download`,
            method: 'GET',
            multipart: true
        },
        onSuccess: async (response) => {
            const blob = new Blob([response], {type: 'application/pdf'});
            const url = URL.createObjectURL(blob);

            setPnaFile(url)
        }
    })

    const {} = useQueryApiClient({
        request: {
            url: `/applicationResources/${data.id}/exploitationRules/download`,
            method: 'GET',
            multipart: true
        },
        onSuccess: async (response) => {
            const blob = new Blob([response], {type: 'application/pdf'});
            const url = URL.createObjectURL(blob);

            setExploitationRules(url)
        }
    })

    const {appendData: signPna} = useQueryApiClient({
        request: {
            url: `/applicationResources/:id/sign`,
            method: 'PUT',
            disableOnMount: true,
            data: {}
        },
        onSuccess(response) {
            router.refresh()
        }
    })

    const isAssignedResourcesDiffers = useMemo(() => {
        const assignedResourceId = data.assignedResource.resourceSubType.id
        const askedResourceId = data.application.resourceSubType.id

        return assignedResourceId !== askedResourceId
    }, [data])
    
    const resourceName = useMemo(() => {
        const {manufacturer, modelName, serialNumber} = data.assignedResource
        return `${manufacturer.value} ${modelName.value} (s.n. ${serialNumber})`
    }, [data])

    const documentDate = useMemo(() => {
        if (data.pnaStatus.id !== PNA_STATUS_ISSUED) return null

        if (!data.attachments) return null

        const document = data.attachments.find(a => a?.documentType?.code === 'pna')

        if (!document) return null

        return dayjs(document.documentDate).format(dateFormat)
    }, [data])

    const onFinish = (values: any) => {

    }

    const onReadyClick = async () => {
        appendDataAsPrepared({}, {id: data.id})
    }

    return (
        <div>
            <Form
                form={form}
                name="persons"
                onFinish={onFinish}
                layout="vertical"
            >
                <Spin spinning={isLoading}>
                    {data &&
                        <>
                            <div className="w-full 2xl:w-3/4">
                              <div className="w-full grid grid-cols-2 gap-6">
                                  {/*Left*/}
                                <div className="flex flex-col gap-y-6">
                                    <div className="bg-white rounded-lg p-6">
                                        {/* main */}
                                        <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                          <div>
                                            <b>P/N akta statuss</b>
                                          </div>
                                          <div>
                                            <b>
                                              <Badge
                                                color={pnaStatuses.find(el => el.code === data.pnaStatus.code)?.color}
                                                text={data.pnaStatus.value}/>
                                            </b>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                          <div>
                                            <b>Izsniegšanas datums</b>
                                          </div>
                                          <div>
                                            {documentDate}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                          <div>
                                            <b>Iglītības iestāde</b>
                                          </div>
                                          <div>{data.application.educationalInstitution.name}</div>
                                        </div>
                                        <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                          <div>
                                            <b>Pieteikums</b>
                                          </div>
                                          <div><Link href={`/admin/application/${data.application.id}`}>{data.application.applicationNumber}</Link>&#160;&#160;({data?.application?.applicationStatus?.value})</div>
                                        </div>
                                    </div>

                                    {/* Resursa dati */}
                                  <div className="bg-white rounded-lg p-6">
                                      <Title level={3} className="pb-3">Resursa dati</Title>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Veids</b>
                                        </div>
                                        <div>{data?.assignedResource?.resourceType?.value}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Paveids</b>
                                        </div>
                                        <div>
                                          <div>{data.assignedResource.resourceSubType.value}</div>
                                            {isAssignedResourcesDiffers &&
                                                <div className="text-red">Pieprasītais resursa paveids - <b>{data.application.resourceSubType.value}</b></div>
                                            }
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Nosaukums</b>
                                        </div>
                                        <div>{resourceName}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Resursa kods</b>
                                        </div>
                                        <div>{data.assignedResource.resourceNumber}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Vērtība (ar PVN)</b>
                                        </div>
                                        <div></div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Nodotā resursa apraksts, vizuālie u.c. defekti</b>
                                        </div>
                                        <div>{data.notes}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Atgriešanas datums</b>
                                        </div>
                                        <div>{data?.returnResourceDate && dayjs(data.returnResourceDate).format(dateFormat)}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Resursa statuss</b>
                                        </div>
                                        <div></div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3">
                                        <div>
                                          <b>Piezīmes</b>
                                        </div>
                                        <div>{data?.internalNotes}</div>
                                      </div>
                                  </div>
                                </div>

                              {/* Right */}
                                <div className="flex flex-col gap-y-6">
                                    {/* Action buttons */}
                                  <div className="bg-white rounded-lg p-6">
                                    <div className="w-full flex gap-2">
                                        {data?.pnaStatus.id === PNA_STATUS_PREPARING &&
                                            <LinkButton type="primary" href={`/admin/pnakts/${data.id}/edit`}>Labot</LinkButton>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_PREPARING &&
                                            <Button type="primary" onClick={() => onReadyClick()}>Gatavs izsniegšanai</Button>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_PREPARING &&
                                            <Button danger className="ml-auto">Dzēst</Button>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_PREPARED &&
                                            <Button onClick={() => signPna({}, {id: data.id})}>Parakstīts</Button>
                                        }
                                        {[PNA_STATUS_PREPARED, PNA_STATUS_PREPARING].includes(data?.pnaStatus.id)  &&
                                            <Button onClick={() => setIsCancelPnaModalOpen(true)}>Atcelt piešķiršanu</Button>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_ISSUED &&
                                            <Button onClick={() => setIsReturnPnaModalOpen(true)}>Atgriezt resursu</Button>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_ISSUED &&
                                            <Button onClick={() => setIsLostStolenModalOpen(true)}>Nozagts/Nozaudēts</Button>
                                        }
                                        {data?.pnaStatus.id === PNA_STATUS_ISSUED &&
                                            <Button onClick={() => setIsChangeTermModalOpen(true)}>Mainīt termiņu</Button>
                                        }
                                        {isChangeTermModalOpen &&
                                            <ChangeTermModal setModalOpen={setIsChangeTermModalOpen}/>
                                        }
                                        {isLostStolenModalOpen &&
                                            <LostStolenModal setModalOpen={setIsLostStolenModalOpen} id={data.id}/>
                                        }
                                        {isReturnPnaModalOpen &&
                                            <ReturnPnaModal setModalOpen={setIsReturnPnaModalOpen} id={data.id}/>
                                        }
                                        {isCancelPnaModalOpen &&
                                            <CancelPnaModal setModalOpen={setIsCancelPnaModalOpen} id={data.id}/>
                                        }

                                    </div>
                                  </div>
                                {/* P/N akta saskaņotājs */}
                                    <div className="bg-white rounded-lg p-6">
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>P/N akta saskaņotājs</b>
                                        </div>
                                        <div>{(data?.application?.submitterPerson?.person && data?.application?.submitterPerson?.person[0]) && 
                                          <>{`${data?.application?.submitterPerson?.person[0].firstName}\u00A0${data?.application?.submitterPerson?.person[0].lastName}`}</>
                                        }</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Resursa lietotājs</b>
                                        </div>
                                        <div>
                                          <div>{`${data.application.resourceTargetPerson.persons[0].firstName} ${data.application.resourceTargetPerson.persons[0].lastName} (p.k. ${data.application.resourceTargetPerson.persons[0].privatePersonalIdentifier})`}</div>
                                          <div className="!text-red"><b>{data?.application.resourceTargetPersonEducationalStatus?.value}</b></div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3 border-b border-gray">
                                        <div>
                                          <b>Termiņš</b>
                                        </div>
                                        <div>{data.assignedResourceReturnDate && dayjs(data.assignedResourceReturnDate).format(dateFormat)}</div>
                                      </div>
                                      <div className="grid grid-cols-[0.8fr,1.2fr] py-3">
                                        <div>
                                          <b>Dokumenta saskaņotājs</b>
                                        </div>
                                        <div>{(data?.userSetPrepared && data?.userSetPrepared.person) &&
                                          <>{`${data?.userSetPrepared.person[0].firstName} ${data?.userSetPrepared.person[0].lastName} (${data?.userSetPrepared.person[0].privatePersonalIdentifier})`}</>
                                        }</div>
                                      </div>

                                    {/* Attachments */}
                                      <div className="py-6 flex gap-x-[34px]">
                                          {pnaFile &&
                                              <a href={pnaFile} target="_blank" download className="text-black flex flex-col items-center gap-y-[15px]">
                                                <FilePdfOutlined className="text-[36px]"/>
                                                P/N akts
                                              </a>
                                          }
                                          {exploitationRules &&
                                              <a href={exploitationRules} target="_blank" download className="text-black flex flex-col items-center gap-y-[15px]">
                                                <FilePdfOutlined className="text-[36px]"/>
                                                Ekspluatācijas noteikumi
                                              </a>
                                          }
                                      </div>
                                    </div>

                                {/* Contact persons */}
                                {(data?.educationalInstitutionContactPersons && data?.educationalInstitutionContactPersons.length > 0) &&
                                    <div className="bg-white rounded-lg p-6">
                                        {data.educationalInstitutionContactPersons.map(person => (
                                            <div key={person.id} className="grid grid-cols-2 p-2 items-center">
                                                <div>
                                                    <b>{person.jobPosition.value}</b>
                                                </div>
                                                <div>
                                                    <p>{person.name}</p>
                                                    <p>{person.phoneNumber}</p>
                                                    <p>{person.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                        </>
                    }
                </Spin>
            </Form>
        </div>
    )
}

export default PnActView
