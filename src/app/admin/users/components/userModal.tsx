
import {
  Checkbox,
  Form,
  Typography,
  Divider,
  Input,
  Modal,
  Select,
  Button,
  DatePicker
} from 'antd';
import { dateFormat, types } from '@/app/utils/AppConfig';

import { UserProfile } from '@/app/components/userProfile';
import { UserType, ListPersonProfileType, RoleType } from '@/app/admin/users/components/users';
import { ButtonWithIcon } from '@/app/components/buttonWithIcon';
import { UserProfileList } from '@/app/admin/users/components/userProfileList';
import { PersonProfileView } from '@/app/admin/users/components/personProfileView';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { useState, useEffect, useMemo } from 'react';
import { personStatus, convertDateStringToDayjs } from '@/app/utils/utils';
import { ClassifierListTermType } from '@/app/admin/classifiers/components/classifiers';
import { ClassifierTermType } from '@/app/admin/classifiers/components/classifierTerms';
import SearchSelectInput from "@/app/components/searchSelectInput"
import { useSession } from 'next-auth/react';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

interface UserModalProps {
  modalStatus: boolean,
  modalState: (val: boolean) => void,
  refresh: () => void,
  activePerson: UserType | null,
  activePersonState: (val: UserType | null) => void,
  activePersonDeleteState: (val: string) => void,
}

const UserModal = ({ refresh, modalStatus, modalState, activePerson, activePersonState, activePersonDeleteState }: UserModalProps) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState<number>(0);
  const [activeProfile, setActiveProfile] = useState<ListPersonProfileType | null>(null);
  const [profileType, setProfileType] = useState<string>('0');
  const [newPerson, setNewPerson] = useState<UserType | null>(null);

  const { data: sessionData } = useSession();
  
  useEffect(() => {
    if (activePerson !== null) {
      setStep(1)
    }
  }, [activePerson]);

  const { data: roles } = useQueryApiClient({
    request: {
      url: '/roles',
    },
  });

  const { data: institutions } = useQueryApiClient({
    request: {
      url: '/classifiers/getByType',
      method: 'GET',
      data: {
        types: ['institution'],
        includeDisabled: false
      },
      enableOnMount: true,
    }
  });

  const { appendData: profileAppendData, isLoading: profileLoader } = useQueryApiClient({
    request: {
      url: '/UserProfile/:id',
      disableOnMount: true
    },
    onSuccess: (response) => {
      if (response.expires) {
        response.expires = convertDateStringToDayjs(response.expires);
      }
      if (response.profileCreationDocumentDate) {
        response.profileCreationDocumentDate = convertDateStringToDayjs(response.profileCreationDocumentDate);
      }

      if (response.roles) {
        response.roleIds = response.roles.map((role: RoleType) => (role.id))
      }
      setProfileType(response.type)
      if (response.type === 'Supervisor') {
        response.supervisorId = response.supervisor?.id
      }
      if (response.type === 'EducationalInstitution') {
        response.educationalInstitutionId = response.educationalInstitution?.id
      }

      if (response.institutionId?.id) {
        response.institutionId = response.institutionId?.id
      }
      response.isDisabled = response.disabled

      form.setFieldsValue(response)
      setStep(2)
    }
  });

  const { appendData: deleteAppendData } = useQueryApiClient({
    request: {
      url: `/UserProfile/:profileId`,
      method: 'DELETE',
    },
    onSuccess: () => {
      refresh()
      modalState(false)
      setStep(0)
    },
  });

  const showConfirm = (profileId: string) => {
    confirm({
      title: 'Vai tiešām vēlaties dzēst šos vienumus?',
      okText: 'Dzēst',
      okType: 'danger',
      cancelText: 'Atcelt',
      async onOk() {
        deleteAppendData([], { profileId });
      },
      onCancel() { },
    });
  };

  const { data: educationalInstitutions } = useQueryApiClient({
    request: {
      url: '/educationalInstitutions',
    }
  });

  const { data: supervisors } = useQueryApiClient({
    request: {
      url: '/supervisors',
    }
  });
  const { appendData: personAppendData, isLoading: postLoader } =
    useQueryApiClient({
      request: {
        url: '/persons',
        method: 'POST',
      },
      onSuccess: (response) => {
        setNewPerson((prevNewPerson) => ({ ...prevNewPerson, id: response.id, userId: response.userId, personTechnicalId: response.personTechnicalId } as UserType))
        form.resetFields();
        setStep((prevStep) => prevStep + 1)
      },
    });

  const { appendData: createAppendProfile, isLoading: personLoader } =
    useQueryApiClient({
      request: {
        url: activeProfile ? `/userProfile/${activeProfile.id}` : '/userProfile',
        method: activeProfile ? 'PUT' : 'POST',
      },
      onSuccess: () => {
        form.resetFields();
        refresh()
        modalState(false)
        setStep(0)

        setActiveProfile(null)
        setNewPerson(null)
      },
    });

  const createPerson = async () => {
    await form.validateFields()
    const values = { ...form.getFieldsValue(true) } // parse for no mutations
    values.isUser = true

    personAppendData(values)
    delete values.isUser
    setNewPerson({ persons: [values] } as UserType)
  };

  const createProfile = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    values.userId = activePerson?.id ?? newPerson?.userId

    createAppendProfile(values);
  };

  const updateProfile = async () => {
    if (activeProfile) {
      await form.validateFields()
      const values = { ...form.getFieldsValue(true) }; // parse for no mutations
      values.userId = activePerson?.id

      createAppendProfile(values)
    }
  };

  const handleCancel = () => {
    setStep(0)
    modalState(false)

    if (activePerson !== null) {
      activePersonState(null)
    }
    if (newPerson !== null) {
      setNewPerson(null)
    }
    form.resetFields()
    refresh()
  };

  const handleProfileEdit = (profile: ListPersonProfileType) => {
    setActiveProfile(profile)
    profileAppendData([], { id: profile.id })
  };

  const handleProfileView = (profile: ListPersonProfileType) => {
    setActiveProfile(profile)
    setStep(3)
  };
  const handleProfileDelete = (profile: ListPersonProfileType) => {
    showConfirm(profile.id)
  };

  const modalTitle = () => {
    if (step === 1) {
      return 'Personas kartīte'
    }

    if (step === 2 || step === 3) {
      return 'Lietotāja persona'
    }

    return 'Jauns lietotājs'
  }

  const modalFooter = () => {
    if (step === 1) {
      let personGlobalStatus: boolean = true
      if (activePerson !== null) {
        personGlobalStatus = !personStatus(activePerson)
      }

      return (
        <div className='flex'>
          {(activePerson && personGlobalStatus) &&
            <Button key="delete" danger onClick={() => activePersonDeleteState(activePerson.id)} >
              Dzēst
            </Button>
          }
          <div  className='!ml-auto'>
            <Button key="back" type="primary" onClick={handleCancel}>
              Labi
            </Button>
          </div>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className='flex'>
          { (activeProfile && !activeProfile.isLoggedIn) &&
            <Button key="delete" onClick={handleCancel} danger>
              Dzēst
            </Button>
          }
          <div className='!ml-auto'>
            <Button key="back" onClick={handleCancel}>
              Atcelt
            </Button>
            { activeProfile ?
              <Button
                key="submit"
                type="primary"
                loading={personLoader}
                onClick={updateProfile}
              >
                Saglabāt
              </Button>
            :
              <Button
                key="submit"
                type="primary"
                loading={personLoader}
                onClick={createProfile}
              >
                Saglabāt
              </Button>
            }
          </div>
        </div>
      )
    }

    if (step === 3) {
      return (
        <>
          { activeProfile &&
            <div className='flex'>
              {/* TODO check if profile can be deleted */}
              {!activeProfile.isLoggedIn &&
                <Button key="delete" onClick={() => handleProfileDelete(activeProfile)} danger>
                  Dzēst
                </Button>
              }
              <Button key="back" className='!mr-auto' onClick={handleCancel}>
                Aizvērt
              </Button>
              <Button
                key="submit"
                type="primary"
                loading={profileLoader}
                onClick={() => profileAppendData([], { id: activeProfile.id })}
              >
                Labot
              </Button>
            </div>
          }
        </>
      )
    }

    return (
      <div className='flex'>
        <div className="ml-auto">
          <Button key="back" onClick={handleCancel}>
            Atcelt
          </Button>
          { activePerson === null &&
            <Button
              key="submit"
              type="primary"
              loading={postLoader}
              onClick={createPerson}
            >
              Saglabāt
            </Button>
          }
        </div>
      </div>
    )
  }

  const onProfileTypeChange = (value: string) => {
    setProfileType(value)
  };

  const handleCreateProfile = () => {
    setStep(2)
    setActiveProfile(null)
  }

  const typesOptions = useMemo(() => {
    switch (sessionData?.user?.permissionType) {
      case 'Country':
        return types
      case 'Supervisor':
        return types.filter(t => ['Supervisor', 'EducationalInstitution'].includes(t.value))
      case 'EducationalInstitution':
        return types.filter(t => t.value === 'EducationalInstitution')
    }
    return []
  }, [types, sessionData])

  return (
    <Modal
      title={modalTitle()}
      centered
      open={modalStatus}
      onCancel={handleCancel}
      footer={modalFooter()}
    >
      {(() => {
        switch (step) {
          case 0:
            return (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Personas kods"
                  name="privatePersonalIdentifier"
                  extra="Ievadīt bez domu zīmes."
                  rules={[{ required: true, pattern: new RegExp(/^\d{11}$/), message: "Atļauts ievadīt tikai 11 ciparus." }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Vārds"
                  name="firstName"
                  rules={[{ required: true, message: "Vārds ir obligāts lauks."}]}
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
                <Paragraph>
                  Vārds un uzvārds tiks atjaunots automātiski pēc personas autentificēšanās ar Latvija.lv
                </Paragraph>
              </Form>
            )
          case 1:
            return (
              <div>
                <div className='mb-5'>
                  <UserProfileList
                    user={newPerson ? newPerson : activePerson}
                    actionEdit={handleProfileEdit}
                    actionView={handleProfileView}
                    actionDelete={handleProfileDelete}
                    refresh={refresh}
                    setUser={(newValue) => {
                      if (newPerson) {
                        setNewPerson({
                          ...newPerson,
                          // @ts-ignore
                          persons: [newValue]
                        })
                      } else {
                        activePersonState({
                          ...activePerson,
                          // @ts-ignore
                          persons: [newValue]
                        })
                      }
                    }}
                  />
                </div>
                <ButtonWithIcon
                  event={() => handleCreateProfile()}
                  label="Jauns profils"
                />
              </div>
            )
          case 2:
            return (
              <Form form={form} layout="vertical">
                {activePerson &&
                  <UserProfile
                    title={`${activePerson.persons[0].firstName} ${activePerson.persons[0].lastName} (${activePerson.persons[0].privatePersonalIdentifier})`}
                    label={false}
                    status={false}
                  />
                }
                <Title level={3}>Profila tiesības</Title>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <div className='grid gap-4 grid-cols-2'>
                    <Form.Item
                      name="type"
                      label="Tiesību līmenis"
                      rules={[{ required: true, message: "Tiesību līmenis ir obligāts lauks." }]}
                    >
                      <SearchSelectInput
                        onChange={onProfileTypeChange}
                        options={typesOptions}
                      />
                    </Form.Item>
                    {profileType === 'Supervisor' &&
                      <>
                        <Form.Item
                          name="supervisorId"
                          label="Tiesību objekts"
                          rules={[{ required: true }]}
                        >
                          <SearchSelectInput options={supervisors.map((value: ClassifierListTermType) => ({
                              label: value.name,
                              value: value.id,
                            }))}
                          />
                        </Form.Item>
                      </>
                    }
                    {profileType === 'EducationalInstitution' &&
                      <>
                        <Form.Item
                          name="educationalInstitutionId"
                          label="Tiesību objekts"
                          rules={[{ required: true }]}
                        >
                          <SearchSelectInput options={educationalInstitutions.map((value: ClassifierListTermType) => ({
                              label: value.name,
                              value: value.id,
                            }))}
                          />
                        </Form.Item>
                      </>
                    }
                  </div>
                </Form.Item>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <div className='grid gap-4 grid-cols-2'>
                    <Form.Item
                      label="Loma"
                      name="roleIds"
                      rules={[{ required: true, message: "Loma ir obligāts lauks." }]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        options={roles.items.map((role: RoleType) => ({
                          label: role.name,
                          value: role.id,
                        }))}
                        filterSort={(optionA: any, optionB: any) =>
                          (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      name="expires"
                      label="Spēkā līdz"
                    >
                      <DatePicker format={dateFormat} />
                    </Form.Item>
                    <Form.Item name="isDisabled" valuePropName="checked">
                      <Checkbox>Bloķēts</Checkbox>
                    </Form.Item>
                  </div>
                </Form.Item>
                <Divider />
                <Title level={3}>Profila dati</Title>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <div className='grid gap-4 grid-cols-2'>
                    <Form.Item
                      name="email"
                      label="E-pasta adrese"
                      rules={[
                        {
                          type: 'email',
                          message: 'Ievadītais e-pasts nav derīgs!',
                        },
                        {
                          required: true,
                          message: 'Lūdzu, ievadiet savu e-pastu!',
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="phoneNumber"
                      label="Tālrunis"
                      rules={[
                        { required: true,  message: 'Tālruņa lauks ir obligāts.' },
                        {
                          pattern: /^[0-9+]*$/i,
                          message: 'Atļautie simboli 0-9, +',
                        },
                        { max: 15 },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <div className='grid gap-4 grid-cols-2'>
                    <Form.Item
                      name="institutionId"
                      label="Institūcija"
                    >
                      <Select showSearch={false} options={institutions.map((institution: ClassifierTermType) => (
                        { value: institution.id, label: institution.value }
                      ))} />
                    </Form.Item>
                    <Form.Item
                      name="job"
                      label="Amats"
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item style={{ marginBottom: "0px" }}>
                  <div className='grid gap-4 grid-cols-2'>
                    <Form.Item
                      name="profileCreationDocumentNumber"
                      label="Pamatojuma dokumenta Nr."
                      rules={[{ required: true,  message: 'Pamatojuma dokumenta Nr. lauks ir obligāts.'}]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="profileCreationDocumentDate"
                      label="Datums"
                      rules={[{ required: true,  message: 'Datuma lauks ir obligāts.' }]}
                    >
                      <DatePicker format={dateFormat} />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item label="Piezīmes" name="notes">
                  <Input />
                </Form.Item>
              </Form>
            )
          case 3:
            return (
              <>
                { activeProfile &&
                  <>
                    {activePerson &&
                      <UserProfile
                        title={`${activePerson.persons[0].firstName} ${activePerson.persons[0].lastName} (${activePerson.persons[0].privatePersonalIdentifier})`}
                        label={false}
                        status={false}
                      />
                    }
                    <PersonProfileView profileId={activeProfile.id} />
                  </>
                }
              </>
            )
          default:
            return null
        }
      })()}
    </Modal>
  );
}

export { UserModal };
