import { Button, Input, Form, Select } from 'antd';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { types } from '@/app/utils/AppConfig';
import { RoleType, UserFilterType, initialValues } from '@/app/admin/users/components/users';
import { ClassifierListTermType } from '@/app/admin/classifiers/components/classifiers';
import SearchSelectInput from '@/app/components/searchSelectInput';

interface UserFiltersProps {
  activeFilters: UserFilterType,
  filterState: (val: UserFilterType) => void
  refresh: (val: UserFilterType) => void,
}

const UserFilters = ({ activeFilters, filterState, refresh }: UserFiltersProps) => {
  const [form] = Form.useForm();

  const { data: supervisors } = useQueryApiClient({
    request: {
      url: '/supervisors',
    },
  })

  const { data: educationalInstitutions } = useQueryApiClient({
    request: {
      url: '/educationalInstitutions',
    },
  })

  const { data: roles } = useQueryApiClient({
    request: {
      url: '/roles',
    },
  });

  const onFinish = (values: any) => {
    const filters: UserFilterType = {
      ...activeFilters,
      educationalInstitutionIds: values.educationalInstitutionIds,
      supervisorIds: values.supervisorIds,
      roleIds: values.roleIds,
      types: values.types,
      person: values.person
    }

    filterState(filters)
    refresh(filters)
  }

  const onReset = () => {
    form.resetFields()

    filterState(initialValues)
    refresh(initialValues)
  }

  return (
    <Form
      form={form}
      name="persons"
      onFinish={onFinish}
      layout="vertical"
      className="flex items-end gap-2"
    >
      <Form.Item name="person" label="Persona">
        <Input />
      </Form.Item>
      <Form.Item name="types" label="Tiesību līmenis">
        <SearchSelectInput
          style={{ width: 200 }}
          mode="multiple"
          showSearch={false}
          options={
            types.map((value) => (
              { value: value.value, label: value.label }
            ))
          }
        />
      </Form.Item>
      <Form.Item name="educationalInstitutionIds" label="Tiesību objekts">
        <SearchSelectInput
          style={{ width: 200 }}
          mode="multiple"
          showSearch={false}
          options={educationalInstitutions.map((educationalInstitution: ClassifierListTermType) => (
            { value: educationalInstitution.id, label: educationalInstitution.name }
          ))}
        />
      </Form.Item>
      <Form.Item name="roleIds" label="Loma">
        <SearchSelectInput
          style={{ width: 200 }}
          mode="multiple"
          showSearch={false}
          options={roles?.items?.map((role: RoleType) => ({
            label: role.name,
            value: role.id,
          }))}
        />
      </Form.Item>
      <Form.Item name="supervisorIds" label="Vadošā institūcija">
        <SearchSelectInput
          style={{ width: 200 }}
          mode="multiple"
          showSearch={false}
          options={supervisors.map((supervisor: ClassifierListTermType) => (
            { value: supervisor.id, label: supervisor.name }
          ))}
        />
      </Form.Item>
      <Form.Item>
        <div className='flex gap-2'>
          <Button type="primary" htmlType="submit">
            Atlasīt
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Notīrīt
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

export { UserFilters };
