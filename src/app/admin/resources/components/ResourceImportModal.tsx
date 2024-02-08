import SearchSelectInput from "@/app/components/searchSelectInput"
import { SelectOption } from "@/app/types/Antd"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { EducationalInstitution } from "@/app/types/EducationalInstitution"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { UploadOutlined } from "@ant-design/icons"
import { Button, Collapse, Form, Modal, Table, Upload, UploadFile } from "antd"
import { useForm } from "antd/es/form/Form"
import { error } from "console"
import { useSession } from "next-auth/react"
import { Dispatch, SetStateAction, useMemo, useState } from "react"


type ResourceImportModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    refetchWithUpdatedData: Function
}

type TError = {
    message: string;
    row: number;
    column: string;
}

const ResourceImportModal = ({setModalOpen, refetchWithUpdatedData}: ResourceImportModalProps) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [educationalInstitutionOptions, setEducationalInstitutionOptions] = useState<SelectOption[]>([])
    const [errors, setErrors] = useState<TError[]>([])

    const [form] = useForm()
    const { data: sessionData } = useSession();
    
    const uploadProps = useMemo(
        () => ({
          beforeUpload: (file: UploadFile) => {
            setFileList((state) => [...state, file]);
            return false;
          },
          onRemove: (file: UploadFile) => {
            if (fileList.some((item) => item.uid === file.uid)) {
              setFileList((fileListItems) =>
                fileListItems.filter((item) => item.uid !== file.uid),
              );
              form.setFieldValue('files', undefined)
              return false;
            }
            return false;
          },
          maxCount: 1,
          fileList: fileList
        }),
        [fileList],
    );

    const {} = useQueryApiClient({
        request: {
          url: '/educationalInstitutions',
        },
        onSuccess(response: EducationalInstitution[]) {
            let filteredOptions;

            if (sessionData?.user?.permissionType === 'Country') {
                filteredOptions = response;
            } else if (sessionData?.user?.permissionType === 'Supervisor') {
                filteredOptions = response.filter(option => String(option.supervisor.id) === sessionData?.user?.id);
            } else {
                filteredOptions = response;
            }

            setEducationalInstitutionOptions(filteredOptions.map(option => ({
                value: option.id,
                label: option.name
            })));
        },
    })

    const {
        isLoading,
        appendData: importData
      } = useQueryApiClient({
        request: {
          url: '/resources/importData',
          method: 'POST',
          multipart: true
        },
        onSuccess: async (responseBlob: any) => {
            try {
                const responseString = await responseBlob.text();
                const responseJson = JSON.parse(responseString)

                if (responseJson.errors.length === 0) {
                    setErrors([])
                    setModalOpen(false)
                    refetchWithUpdatedData()
                } else {
                    setErrors(responseJson.errors)
                }
            } catch (e) {
                console.error(e)
            }
        }
    })

    const columns = [
        {
            key: 'row',
            dataIndex: "row",
            title: "Rinda",
        },
        {
            key: 'column',
            dataIndex: "column",
            title: "Kolonna",
        },
        {
            key: 'message',
            dataIndex: "message",
            title: "Paziņojums",
        }
    ]

    const onSubmit = (values: any) => {
        const formData = new FormData()
        formData.append('educationalInstitutionId', ['Country', 'Supervisor'].includes(sessionData?.user?.permissionType as string) ? values.educationalInstitutionId : sessionData?.user?.educationalInstitutionId);
        formData.append('file', values.file?.file);
        importData(formData)
    }

    return (
        <Modal
            open={true}
            footer={false}
            onCancel={() => setModalOpen(false)}
        >
            <Form onFinish={onSubmit} layout="vertical">
                {['Country', 'Supervisor'].includes(sessionData?.user?.permissionType as string) && 
                    <Form.Item 
                        name="educationalInstitutionId"
                        label="Izglītības iestāde"
                        rules={[{required: true, message: 'Izglītības iestāde ir obligāts lauks'}]}
                    >
                        <SearchSelectInput options={educationalInstitutionOptions} />
                    </Form.Item>
                }
                <Form.Item 
                    name="file" 
                >
                    <Upload {...uploadProps} accept=".xlsx">
                        <Button icon={<UploadOutlined />} disabled={fileList.length > 0}>Pievienot datni</Button>
                    </Upload>
                </Form.Item>
                {errors.length > 0 &&
                    <Collapse accordion items={[
                        {
                            key: '1',
                            label: 'Kļūdas:',
                            children: <Table columns={columns} dataSource={errors} pagination={false}/>
                        }
                    ]} className="mb-2"/>
                }
                <Button type="primary" htmlType="submit" loading={isLoading}>Importēt</Button>
            </Form>
        </Modal>
    )
}

export default ResourceImportModal