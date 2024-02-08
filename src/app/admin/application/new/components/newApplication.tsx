'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Form,
  Divider,
  Space,
  Button,
} from 'antd';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { UploadFile } from 'antd/lib/upload/interface';
import './style.css'
import { SelectOption } from '@/app/types/Antd';
import { useSession } from 'next-auth/react';
import ResourceUserSection from './ResourceUserSection';
import ResourceTypeSection from './ResourceTypeSection';
import ResourceContactsSection from './ResourceContactsSection';
import ResourceJustificationSection from './ResourceJustificationSection';
import { APPLICANT_STATUS_SUBMITTED, CONTACT_TYPE_EMAIL, CONTACT_TYPE_PHONE_NUMBER, EDUCATIONAL_INSTITUTION, LEARNER, PARENT_GUARDIAN, RESOURCE_TARGET_PERSON_TYPE_LEARNER } from './applicantConstants';
import { dateRequestFormat } from '@/app/utils/AppConfig';
import dayjs from 'dayjs';
import useHandleError, { DEFAULT_ERROR_MESSAGE } from '@/app/utils/useHandleError';
import { goToUrl } from '@/app/utils/utils';
import LinkButton from '@/app/components/LinkButton';

const NewApplication = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [resourceUser, setResourceUser] = useState<string | null>(null);
  const [resourceUserOptions, setResourceUserOptions] = useState<SelectOption[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [handleError] = useHandleError();

  const { data: sessionData } = useSession();
  const userPermissions: string[] = sessionData?.user?.permissions || []

  const { appendData } = useQueryApiClient({
    request: {
      url: '/applications',
      method: 'POST',
    },
    onSuccess: (response) => {
      const documentForm = new FormData();

      const values = form.getFieldsValue(true)

      documentForm.append('ApplicationId', response.id);
      documentForm.append('File', values.documentFile.file);
      documentForm.append('AttachmentNumber', values.documentNr);

      const documentDate = values.documentDate['$d']

      documentForm.append('attachmentDate', dayjs(documentDate).format(dateRequestFormat))

      appendDocument(documentForm)
    },
    onError: (error) => {
      if(error.message === "application.alreadyExists"){
        handleError({ error: 'Ja vēlaties iesniegt jaunu pieteikumu, lūdzu atsauciet iepriekšējo' })
      } else {
        handleError({ error: DEFAULT_ERROR_MESSAGE })
      }
    },
    handleDefaultError: false
  });

  const { appendData: appendDocument } = useQueryApiClient({
    request: {
      url: '/applicationAttachments',
      method: 'POST',
      multipart: true
    },
    onSuccess: () => {
      goToUrl('/admin/applications', router)
    },
  });

  const { data: personData} = useQueryApiClient({
    request: {
      url: `/Persons/getByUserId(${sessionData?.user?.id})`,
      disableOnMount: !userPermissions.includes('user_person.view')
    },
  });

  const onFinish = async (values: any) => {
    const resourceUser = values.resourceUser

    const user = resourceUserOptions.find(opt => opt.value === resourceUser)

    if (!user) {
      handleError({error: 'Nav atrasts neviens lietotājs'})
      return
    }

    const activeEducationData = user.rest.activeEducationData.find((data: any) => data.educationalInstitutionId === sessionData?.user?.educationalInstitutionId)

    if (!activeEducationData) {
      handleError({error: 'Jūsu un lietotāja izglītības iestādes nesakrīt'})
      return
    }

    let postData = {
      applicationStatusId: APPLICANT_STATUS_SUBMITTED,
      submitterTypeId: values.resourceApplicant,
      socialStatus: values.socialStatus,
      applicationSocialStatuses: values.socialStatuses,
      resourceSubTypeId: values.resourceSubTypeId,
      educationalInstitutionId: activeEducationData.educationalInstitutionId,
      resourceTargetPersonClassGrade: activeEducationData.classGroup,
      resourceTargetPersonClassParallel: activeEducationData.classGroupLevel,
      resourceTargetPersonEducationalProgram: activeEducationData.educationProgram,
      resourceTargetPersonTypeId: RESOURCE_TARGET_PERSON_TYPE_LEARNER,
    }
    postData = setSubmitterAndTarget(postData, values.resourceApplicant, user, values)

    await appendData(postData)
  }

  const setSubmitterAndTarget = (postData: any, applicantRole: string, user: SelectOption, values: any): any => {
    if (applicantRole === PARENT_GUARDIAN) {
      postData.resourceTargetPerson = {
        firstName: user.rest.firstName,
        lastName: user.rest.lastName,
        privatePersonalIdentifier: user.rest.privatePersonalIdentifier,
      }
      postData.submitterPerson = {
        firstName: values.applicantName,
        lastName: values.applicantSurname,
        privatePersonalIdentifier: values.applicantPersonalCode,
        contactInformation: [
          {
            typeId: CONTACT_TYPE_EMAIL,
            value: values.email
          },
          {
            typeId: CONTACT_TYPE_PHONE_NUMBER,
            value: values.phoneNumber
          },
        ]
      }
    }

    if (applicantRole === LEARNER) {
      postData.resourceTargetPerson = {
        firstName: user.rest.firstName,
        lastName: user.rest.lastName,
        privatePersonalIdentifier: user.rest.privatePersonalIdentifier,
      }
      postData.submitterPerson = {
        firstName: user.rest.firstName,
        lastName: user.rest.lastName,
        privatePersonalIdentifier: user.rest.privatePersonalIdentifier,
        contactInformation: [
          {
            typeId: CONTACT_TYPE_EMAIL,
            value: values.email
          },
          {
            typeId: CONTACT_TYPE_PHONE_NUMBER,
            value: values.phoneNumber
          },
        ]
      }
    }

    if (applicantRole === EDUCATIONAL_INSTITUTION) {
      postData.resourceTargetPerson = {
        firstName: user.rest.firstName,
        lastName: user.rest.lastName,
        privatePersonalIdentifier: user.rest.privatePersonalIdentifier,
      }
      postData.submitterPerson = {
        firstName: personData?.firstName,
        lastName: personData?.lastName,
        privatePersonalIdentifier: personData?.privatePersonalIdentifier,
        contactInformation: [
          {
            typeId: CONTACT_TYPE_EMAIL,
            value: values.email
          },
          {
            typeId: CONTACT_TYPE_PHONE_NUMBER,
            value: values.phoneNumber
          },
        ]
      }
    }

    return postData
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <ResourceUserSection
          resourceUserOptions={resourceUserOptions}
          resourceUser={resourceUser}
          setResourceUser={setResourceUser}
          form={form}
          setResourceUserOptions={setResourceUserOptions}
        />
        <Divider />
        <ResourceTypeSection 
          form={form}
          resourceUser={resourceUser}
        />
        <ResourceContactsSection />
        <ResourceJustificationSection fileList={fileList} setFileList={setFileList} form={form}/>
        <Form.Item>
          <Space>
            <LinkButton href='/admin/applications' htmlType="button">
              Atcelt
            </LinkButton>
            <Button type="primary" htmlType="submit" loading={false}>
              Saglabāt
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export { NewApplication };
