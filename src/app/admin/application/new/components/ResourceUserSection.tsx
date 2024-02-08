'use client';

import { Dispatch, MouseEventHandler, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { FormInstance, RadioChangeEvent } from 'antd';
import {
  Form,
  Select,
  Typography,
  Divider,
  Space,
  Input,
  Radio,
  Checkbox,
  Button,
  Row,
  Col
} from 'antd';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { ClassifierTermType } from '@/app/admin/classifiers/components/classifierTerms';
import { SelectOption } from '@/app/types/Antd';
import { ClassifierResponse } from '@/app/types/Classifiers';
import { EDUCATIONAL_INSTITUTION, EMPLOYEE, LEARNER, PARENT_GUARDIAN } from './applicantConstants';
import { useSession } from 'next-auth/react';
import useHandleError from '@/app/utils/useHandleError';

const { Title, Text } = Typography;

type TResourceUserSectionProps = {
    resourceUserOptions: SelectOption[];
    resourceUser: string | null;
    setResourceUser: Dispatch<SetStateAction<string | null>>;
    form: FormInstance;
    setResourceUserOptions: Dispatch<SetStateAction<SelectOption[]>>;
}

const ResourceUserSection = ({
    resourceUserOptions,
    resourceUser,
    setResourceUser,
    form,
    setResourceUserOptions
}: TResourceUserSectionProps) => {
    const [socialGroupStatus, setSocialGroupStatus] = useState<boolean>(false);
    const [applicantRole, setApplicantRole] = useState<string | null>(null);
    const [getPersonDataLoading, setGetPersonDataLoading] = useState<boolean>(false);
    const [personalCodeError, setPersonalCodeError] = useState<string | null>(null)

    const { data: sessionData } = useSession();
    const [handleError] = useHandleError();
    
    const socialStatuses = Form.useWatch('socialStatuses', form)
    const applicantPersonalCode = Form.useWatch('applicantPersonalCode', form)
    const applicantName = Form.useWatch('applicantName', form)
    const applicantSurname = Form.useWatch('applicantSurname', form)
    const eduPersonalCode = Form.useWatch('eduPersonalCode', form)

    useEffect(() => {
      setPersonalCodeError(null)
    }, [eduPersonalCode])

    const resourceUserSchoolOptions = useMemo(() => {
        if (!resourceUser) return []
    
        const user = resourceUserOptions.find(opt => opt.value === resourceUser)
    
        if (!user) return []

        if (applicantRole === PARENT_GUARDIAN) {
            return user.rest.activeEducationData.map((data: any) => ({
              value: data.supervisorCode,
              label: data.educationInstitutionName,
              rest: data
            }))
        } else {
            return [{
                value: user.rest.supervisorCode,
                label: user.rest.educationInstitutionName,
                rest: user.rest
            }]
        }
    
    }, [resourceUser])

  const isGetDataButtonDisabled = useMemo(() => {
    let eduPersonalCodeIsValidated = true
    if (eduPersonalCode) {
      eduPersonalCodeIsValidated = /^[0-9]*$/.test(eduPersonalCode)
    }
    if (applicantRole !== PARENT_GUARDIAN) {
      return !eduPersonalCode || !eduPersonalCodeIsValidated
    }

    let applicantPersonalCodeIsValidated = true
    if (applicantPersonalCode) {
      applicantPersonalCodeIsValidated = /^[0-9]*$/.test(applicantPersonalCode)
    }
    return (!applicantPersonalCode || !applicantName || !applicantSurname) || !applicantPersonalCodeIsValidated
  }, [applicantPersonalCode, applicantName, applicantSurname, applicantRole, eduPersonalCode])

    const {
        data: applicantRoles
      } = useQueryApiClient({
        request: {
          url: `/classifiers?type=applicant_role&includeDisabled=false`,
        },
      });
    const {
        data: socialStatusesOptions
      } = useQueryApiClient({
        request: {
          url: `/classifiers?type=social_status&includeDisabled=false`,
        },
      });

      const getPersonData = async () => {
        if(applicantRole === PARENT_GUARDIAN || applicantRole === LEARNER || applicantRole === EDUCATIONAL_INSTITUTION || applicantRole === EMPLOYEE){
          setGetPersonDataLoading(true)
          await getData()
        }
      }

      const identifyRequest = () => {
        let url;
        let privatePersonalIdentifier;
        switch (applicantRole) {
          case PARENT_GUARDIAN:
            url = '/ViisServices/asParentOrGuardian';
            privatePersonalIdentifier = applicantPersonalCode;
            break;
          case (LEARNER):
            url = '/ViisServices/asEducatee';
            privatePersonalIdentifier = eduPersonalCode;
            break;
          case EDUCATIONAL_INSTITUTION:
            url = '/ViisServices/asEducatee';
            privatePersonalIdentifier = eduPersonalCode;
            break;
          case EMPLOYEE:
            url = '/ViisServices/asEmployee';
            privatePersonalIdentifier = eduPersonalCode;
            break;
          default:
            url = '';
            privatePersonalIdentifier = ''
        }
        return {url, privatePersonalIdentifier}
      }

      const { refetch: getData } = useQueryApiClient({
        request: {
            url: identifyRequest().url,
          data: {
            privatePersonalIdentifier: identifyRequest().privatePersonalIdentifier
          },
          method: 'GET',
          disableOnMount: true
        },
        onSuccess: (response: any[]) => {
          if (hasMatchingEducationalInstitutionId(response, sessionData?.user?.educationalInstitutionId)) {
            setResourceUserOptions(response.map(option => ({
              label: `${option.firstName} ${option.lastName} (p.k. ${option.privatePersonalIdentifier})`,
              value: option.privatePersonalIdentifier,
              rest: option
            })))
            if (response.length === 1) {
              setResourceUser(response[0].privatePersonalIdentifier)
              form.setFieldValue('resourceUser', response[0].privatePersonalIdentifier)
            }
            setPersonalCodeError(null)
          } else {
            if (response.length > 0) {
              handleError({error: 'Jūsu un lietotāja izglītības iestādes nesakrīt'})
            } else {
              setPersonalCodeError('Pēc šī personas koda nav atbilstošu datu')
            }
          }
},
        onFinally: () => {
          setGetPersonDataLoading(false)
        }
      });
    
      const hasMatchingEducationalInstitutionId = (data: any[], userEducationalInstitutionId: number | undefined) => {
        if (applicantRole !== EMPLOYEE) {
          return data.some((item) => {
            return item.activeEducationData.some((eduData: any) => {
              return eduData.educationalInstitutionId === userEducationalInstitutionId;
            });
          });

        } else {
          return data.some((item) => {
            return item.activeWorkData.some((workData: any) => {
              return workData.educationalInstitutionId === userEducationalInstitutionId;
            });
          });
        }
    }

      const onApplicantRolesChange = (value: string) => {
        setApplicantRole(value)
      };

    const onSocialStatusChange = (e: RadioChangeEvent) => {
        setSocialGroupStatus((e.target.value == 0) ? false : true)
      };
    return (
        <>
            <Title level={4}>Resursa lietotājs</Title>
            <Divider />
            <Row className='sm:w-[500px]'>
            <Col span={24} sm={12}>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <Form.Item
                      name="resourceApplicant"
                      label="Resursa pieteicējs"
                      rules={[{ required: true, message:"Lūdzu izvēlieties resursa pieteicēju." }]}
                      className='w-full sm:w-[200px]'
                  >
                      <Select
                        // style={{ width: 200 }}
                        showSearch={false}
                        onChange={(value) => onApplicantRolesChange(value)}
                        options={applicantRoles.map((applicantRoleItem: ClassifierTermType) => ({
                            label: applicantRoleItem.value,
                            value: applicantRoleItem.id,
                            code: applicantRoleItem.code
                        }))}
                      />
                  </Form.Item>
                </Form.Item>
            </Col>
            {applicantRole && [PARENT_GUARDIAN].includes(applicantRole) &&
                <>
                <Col span={24} sm={12}>
                    <Form.Item
                        name="applicantPersonalCode"
                        label="Pieteicēja personas kods"
                        extra="Ievadīt bez domu zīmes."
                        rules={[
                          { required: true, message:"Lūdzu ievadiet izglītojamā personas kodu." },
                          {
                            pattern: new RegExp(/^\d{11}$/),
                            message: 'Nekorekts personas kods',
                          },
                        ]}
                        className='w-full sm:w-[200px]'
                    >
                    <Input />
                    </Form.Item>
                </Col>
                <Col span={24} sm={12}>
                    <Form.Item
                        name="applicantName"
                        label="Pieteicēja vārds"
                        rules={[{ required: true, message:"Lūdzu ievadiet pieteicēja vārdu." }]}
                        className='w-full sm:w-[200px]'
                    >
                    <Input maxLength={100}/>
                    </Form.Item>
                </Col>
                <Col span={24} sm={12}>
                    <Form.Item
                        name="applicantSurname"
                        label="Pieteicēja uzvārds"
                        rules={[{ required: true, message:"Lūdzu ievadiet pieteicēja uzvārdu." }]}
                        className='w-full sm:w-[200px]'
                    >
                    <Input  maxLength={100} />
                    </Form.Item>
                </Col>
                </>
                }
            </Row>
            { applicantRole &&
            <>
                <Form.Item style={{ marginBottom: "0px" }}>
                <Space>
                    {[EDUCATIONAL_INSTITUTION, LEARNER, EMPLOYEE].includes(applicantRole) &&
                    <Form.Item
                        name="eduPersonalCode"
                        label="Izglītojamā personas kods"
                        extra="Ievadīt bez domu zīmes."
                        rules={[
                          { required: true, message:"Lūdzu ievadiet izglītojamā personas kodu." },
                          {
                            pattern: new RegExp(/^\d{11}$/),
                            message: 'Nekorekts personas kods',
                          },
                        ]}
                        className='!pt-[18px]'
                    >
                        <Input />
                    </Form.Item>
                    }
                    <Button htmlType="button" onClick={getPersonData} disabled={isGetDataButtonDisabled} loading={getPersonDataLoading}>
                      Izgūt datus
                    </Button>
                </Space>
                    {personalCodeError &&
                      <p className={`text-red ${![PARENT_GUARDIAN].includes(applicantRole) ? 'mt-[-22px]' : '' }`}>{personalCodeError}</p>
                    }
                </Form.Item>
                { resourceUserOptions.length > 0 &&
                <>
                    <Row className='sm:w-[500px]'>
                    <Col span={24} sm={12}>
                        <Form.Item
                        name="resourceUser"
                        label="Resursa lietotājs"
                        >
                            <Select 
                              options={resourceUserOptions} 
                              bordered={resourceUserOptions.length !== 1} 
                              disabled={resourceUserOptions.length === 1} 
                              className='w-full sm:!w-[200px]' 
                              onChange={setResourceUser}
                            />
                        </Form.Item>
                    </Col>
                                        </Row>
                </>
                }
            </>
            }
            {applicantRole && [PARENT_GUARDIAN, EDUCATIONAL_INSTITUTION, LEARNER].includes(applicantRole) && 
            <>
            <Form.Item 
                name="socialStatus" 
                label="Vai izglītojamais atbilst kādai sociālai atbalsta grupai?"
                rules={[{ required: true, message:"Lūdzu izvēlieties vai izglītojamais atbilst kādai sociālai atbalsta grupai." }]}
            >
                <Radio.Group onChange={(e) => onSocialStatusChange(e)}>
                <Radio value={1}>Atbilst</Radio>
                <Radio value={0}>Neatbilst</Radio>
                </Radio.Group>
            </Form.Item>
            {socialGroupStatus  &&
                <Form.Item 
                name="socialStatuses" 
                label="Norādiet vismaz vienu sociālā atbalsta grupu"
                rules={[{ required: true, message:"Lūdzu norādiet vismaz vienu sociālā atbalsta grupu." }]}
                >
                <Checkbox.Group
                    className='[&>label]:block block [&>label>span]:inline-flex'
                    options={socialStatusesOptions ? socialStatusesOptions.map((option: ClassifierResponse) => ({
                        value: option.id,
                        label: option.value
                    })) : []}
                />
                </Form.Item>
            }
            {Array.isArray(socialStatuses) && socialStatuses.length > 0 &&
                <Form.Item 
                  name="socialStatusApproved" 
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('socialStatusApproved')) {
                          return Promise.resolve();
                        }
                        return Promise.reject('Lūdzu atzīmējiet.');
                      },
                    }),
                  ]}
                  valuePropName="checked"
                >
                  <Checkbox><span style={{color: 'red'}}>*</span> Resursa pieprasītājs ir informēts, ka Izglītības iestādei ir tiesības pārbaudīt norādītā statusa atbilstību, pieprasot datus no citām iestādēm un informācijas sistēmām.</Checkbox>
                </Form.Item>
            }
            </>
            }
        </>
    )
}

export default ResourceUserSection