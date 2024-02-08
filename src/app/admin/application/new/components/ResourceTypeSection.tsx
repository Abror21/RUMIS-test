'use client';

import {
  Form,
  FormInstance,
  Typography,
} from 'antd';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { SelectOption } from '@/app/types/Antd';
import { ClassifierResponse } from '@/app/types/Classifiers';
import { useEffect, useState } from 'react';
import SearchSelectInput from '@/app/components/searchSelectInput';
import { CheckDuplicateResponse } from '@/app/types/Applications';

const { Title } = Typography;

type ResourceTypeSectionProps = {
  form: FormInstance,
  resourceUser: string | null
}

type TSubType = {
  id: string;
  label: string;
  value: number | string;
  payload: any
}

const ResourceTypeSection = ({form, resourceUser}: ResourceTypeSectionProps) => {
  const [resourceTypeOptions, setResourceTypeOptions] = useState<SelectOption[]>([]);

  const [allSubTypes, setAllSubTypes] = useState<TSubType[]>([])
  const [filteredSubTypes, setFilteredSubTypes] = useState<TSubType[]>([])

  const [eduInstitutionOfResource, setEduInstitutionOfResource] = useState<string | null>(null)

  const resourceType = Form.useWatch('resourceType', form)
  const resourceSubTypeId = Form.useWatch('resourceSubTypeId', form)
  const applicantPersonalCode = Form.useWatch('applicantPersonalCode', form)
  const eduPersonalCode = Form.useWatch('eduPersonalCode', form)

  useEffect(() => {
    if (resourceType) {
      // @ts-ignore
      const filteredValues = allSubTypes.filter(type => type.payload.resource_type === resourceType)
      setFilteredSubTypes(filteredValues)

      if (!filteredValues.find(v => v.id === resourceSubTypeId)) {
        form.setFieldValue('resourceSubTypeId', null)
      }
    }
  }, [resourceType])

  useEffect(() => {
    if (resourceSubTypeId && resourceUser) {
      checkDuplicate({
        PrivatePersonalIdentifier: resourceUser,
        ResourceSubTypeId: resourceSubTypeId
      })
    } else {
      setEduInstitutionOfResource(null)
    }
  }, [resourceSubTypeId])

  const {} = useQueryApiClient({
    request: {
      url: `/classifiers?type=resource_type&includeDisabled=false`,
    },
    onSuccess: (response: ClassifierResponse[]) => {
      setResourceTypeOptions(response.map(item => ({
        value: item.code,
        label: item.value
      })))
    }
  });

  const {} = useQueryApiClient({
    request: {
      url: `/classifiers?type=resource_subtype&includeDisabled=false`,
    },
    onSuccess: (response: ClassifierResponse[]) => {
      const parsedResponse = response.map(item => {
        // @ts-ignore
        const payloadObj = JSON.parse(item.payload);
        return {
            ...item,
            value: item.id,
            label: item.value,
            payload: payloadObj
        };
      });
      setAllSubTypes(parsedResponse)
      setFilteredSubTypes(parsedResponse)
    }
  });

  const {appendData: checkDuplicate} = useQueryApiClient({
    request: {
      url: `/applications/checkDuplicate`,
      disableOnMount: true
    },
    onSuccess: (response: CheckDuplicateResponse) => {
      if (response) {
        setEduInstitutionOfResource(response.educationalInstitution.name)
      } else {
        setEduInstitutionOfResource(null)
      }
    }
  });
    return (
        <>
            <Title level={4}>Resurss</Title>
            <Form.Item
              name="resourceType"
              label="Resursa veids"
              rules={[{ required: true, message:"Lūdzu izvēlieties resursa veidu." }]}
            >
              <SearchSelectInput  options={resourceTypeOptions} className='sm:!w-[200px]'/>
            </Form.Item>
            <Form.Item
              name="resourceSubTypeId"
              label="Resursa paveids"
              rules={[{ required: true, message:"Lūdzu izvēlieties resursa paveidu." }]}
              className='!mb-0'
            >
              <SearchSelectInput options={filteredSubTypes} className='sm:!w-[200px]'/>
            </Form.Item>
              {eduInstitutionOfResource &&
                <>
                  <p className='text-red-600'>Atkārtoti šādu resursu nevar pieteikt.</p>
                  <p className='text-red-600'>Personai ir izsniegts - <b>{filteredSubTypes.find(sub => sub.id === resourceSubTypeId)?.label}</b></p>
                  <p className='text-red-600'>Izglītības iestāde: - {eduInstitutionOfResource}</p>
                </>
              }
        </>
    )
}

export default ResourceTypeSection
