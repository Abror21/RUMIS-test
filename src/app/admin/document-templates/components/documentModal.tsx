import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Spin
} from 'antd';
import { useState, useEffect } from 'react';

import { dateFormat } from '@/app/utils/AppConfig';
import { ClassifierResponse } from '@/app/types/Classifiers';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import SearchSelectInput from "@/app/components/searchSelectInput"
import Ckeditor from "@/app/admin/document-templates/components/ckeditor"
import { convertDateStringToDayjs } from '@/app/utils/utils';
import { v4 } from "uuid";
import { Parameter } from '@/app/types/Parameter';
import { Supervisor } from '@/app/types/Supervisor';
import dayjs from 'dayjs';

type DocumentModalProps = {
  setModalOpen: Function
  document?: any
  setActiveDocument: Function
  refetchDocuments: Function
  view: boolean,
  setView: Function
}

const setFields = (data: any) => {
  const permissionType = data?.permissionType === 'Country' ? 'Country' : data?.supervisorId;
  return {
    Title: data?.title,
    Code: data?.documentType?.code,
    Hyperlink: data?.hyperlink,
    PermissionType: permissionType,
    ResourceTypeId: data?.resourceType?.id,
    validFrom: data?.validFrom,
    validTo: data?.validTo,
  }
}

const DocumentModal = ({ setModalOpen, document, setActiveDocument, refetchDocuments, view, setView }: DocumentModalProps) => {
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(document?.documentType?.code || null);
  const [textEditor, setTextEditor] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [documentRequest, setDocumentRequest] = useState<string>('POST');
  const [form] = Form.useForm();

  useEffect(() => {
    if (!view) {
      setStep(1)
    }
  }, [view]);

  useEffect(() => {
    if (document?.id && !view) {
      setDocumentRequest("PUT")
    }
    if (document?.id && view) {
      setDocumentRequest("POST")
    }
    if (document?.id) {
      if (typeof document.validFrom === 'string') {
        document.validFrom = convertDateStringToDayjs(document.validFrom);
      }
      if (typeof document.validTo === 'string') {
        document.validTo = convertDateStringToDayjs(document.validTo);
      }
      downloadAppendData([], { id: document?.id });
      if (step === 1) {
        form.setFieldsValue(setFields(document));
      }
    }
  }, [document, step]);

  const {
    isLoading: isLoadingClassifiers,
    data: dataTypes
  } = useQueryApiClient({
    request: {
      url: `/classifiers/getbytype`,
      data: {
        types: ['document_type', 'resource_type'],
        includeDisabled: false
      }
    },
  });
  const {
    isLoading: isLoadingSupervisors,
    data: supervisors
  } = useQueryApiClient({
    request: {
      url: `/Supervisors`,
    },
  });
  const { appendData: downloadAppendData, isLoading: fileLoader } = useQueryApiClient({
    request: {
      url: `/documentTemplates/:id/download`,
      method: 'GET',
      multipart: true,
      disableOnMount: true,
    },
    onSuccess: async (response) => {
      // TODO: remove html body tags
      const str = await response.text();
      setTextEditor(str);
    },
  });
  const { appendData: createAppendData, isLoading: postLoader } =
    useQueryApiClient({
      request: {
        url: documentRequest === 'PUT' ? `/documentTemplates/${document?.id}` : `/documentTemplates`,
        method: documentRequest === 'PUT' ? 'PUT' : 'POST',
        multipart: true
      },
      onSuccess: () => {
        setActiveDocument(null);
        setModalOpen(false);
        form.resetFields();
        setTextEditor('');
        refetchDocuments();
      },
    });
  const { data: documentTemplate, appendData: getDocumentSample } = useQueryApiClient({
    request: {
      url: `DocumentTemplates/${document?.id}/sample`,
      disableOnMount: true,
    }
  })

  const blobToFile = (theBlob: Blob, fileName: string) => {
    return new File(
      [theBlob as any], // cast as any
      fileName,
      {
        lastModified: new Date().getTime(),
        type: theBlob.type
      }
    )
  }

  const handleDocumentTemplate = async () => {
    await form.validateFields();
    const values = { ...form.getFieldsValue(true) }; // parse for no mutations
    const newForm = new FormData();
    Object.keys(values).forEach((fieldKey: string) => {
      if (!values[fieldKey]) return
      if (fieldKey === "PermissionType") {
        if (values[fieldKey] === "Country") {
          values[fieldKey] = 0;
        } else {
          newForm.append("SupervisorId", values[fieldKey]);
          values[fieldKey] = 1;
        }
      }
      if ((fieldKey === 'validFrom' || fieldKey === 'validTo') && values[fieldKey] === null) {
        values[fieldKey] = '';
      }
      if ((fieldKey === "Hyperlink" && values["Code"] !== "hyperlink")) {
        return;
      }
      newForm.append(fieldKey, values[fieldKey]);
    })
    if (values["Code"] !== "hyperlink") {
      let blob = new Blob([`<html><body>${textEditor}</body></html>`], { type: 'text/html' });
      newForm.append('File', blobToFile(blob, `${v4()}.html`));
    }
    createAppendData(newForm);
  };

  const onTypeChange = (value: string) => {
    setActiveDocumentType(value)
  };

  const handleCancel = () => {
    setStep(0)
    setModalOpen(false)
    if (step === 1) {
      form.resetFields()
    }
    setActiveDocument(null)
    setTextEditor('')
  };

  const modalTitle = () => {
    if (step === 0 && document) {
      return `Skatīt dokumenta šablonu - ${document.title}`
    }
    if (step === 1 && document) {
      return `Rediģēt dokumenta šablonu - ${document.title}`
    }
    if (step === 2) {
      return `Dokumenta šablona - ${document.title} priekšskatījums`
    }
    return 'Jauns dokumenta šablons'
  }

  const modalButtons = () => {
    if (step === 0) {
      return (<div>
        <Button
          key="back"
          onClick={handleCancel}
        >
          Aizvērt
        </Button>
        <Button
          key="copy"
          onClick={() => setStep(1)}
        >
          Kopēt
        </Button>
        <Button
          key="preview"
          onClick={() => {
            setStep(2)
            getDocumentSample()
          }}
        >
          Priekšskats
        </Button>
        <Button
          key="edit"
          type="primary"
          onClick={() => {
            setStep(1)
            setView(false)
          }}
        >
          Labot
        </Button>
      </div>)
    }

    if (step === 2) {
      return (
        <Button
          key="back"
          onClick={handleCancel}
        >
          Aizvērt
        </Button>
      )
    }

    return (<div>
      <Button
        key="back"
        onClick={handleCancel}
      >
        Aizvērt
      </Button>
      <Button
        key="submit"
        type="primary"
        loading={postLoader}
        onClick={handleDocumentTemplate}
      >
        Saglabāt
      </Button>
    </div>)
  }

  return (
    <Modal
      title={<h2 className='text-2xl mb-3'>{modalTitle()}</h2>}
      centered
      open={true}
      width={1000}
      onCancel={handleCancel}
      footer={modalButtons()}
    >
      {fileLoader &&
        <Spin />
      }
      {step === 0 &&
        <>
          <h3 className='text-xl font-semibold'>{document?.documentType?.code} ({document?.resourceType?.value})</h3>
          <hr />
          <h4 className='text-lg'>{document?.documentType?.value}</h4>
          <p className='text-lg'>{document?.permissionType}</p>
          {
            (document?.validFrom || document?.validTo) &&
            <p className='text-lg mb-6'>
              {document?.validFrom && `Spēkā no ${dayjs(document?.validFrom).format(dateFormat)}`}
              {(document?.validFrom && document?.validTo) && ' - '}
              {document?.validTo && `līdz ${dayjs(document?.validTo).format(dateFormat)}`}
            </p>
          }
          <h6 className='text-xl font-medium'>Dokumenta teksts</h6>
          <p dangerouslySetInnerHTML={{ __html: textEditor }}></p>
        </>
      }
      {step === 1 &&
        <Spin spinning={isLoadingClassifiers || isLoadingSupervisors}>
          <Form form={form} layout="vertical" >
            <Form.Item
              label="Dokumenta veidnes nosaukums"
              name="Title"
              rules={[{ required: true, message: "Lūdzu ievadi dokumenta veidnes nosaukumu." }]}
            >
              <Input />
            </Form.Item>
            <div className='grid gap-4 grid-cols-2'>
              <Form.Item
                name="Code"
                label="Dokumenta veids"
                rules={[{ required: true }]}
              >
                <SearchSelectInput
                  options={
                    dataTypes?.filter((type: ClassifierResponse) => type.type === 'document_type')?.map((item: Parameter) => ({
                      label: item.value,
                      value: item.code,
                    }))}
                  onChange={onTypeChange}
                />
              </Form.Item>
              {activeDocumentType === 'hyperlink' &&
                <>
                  <Form.Item
                    name="Hyperlink"
                    label="Saites adrese"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              }
            </div>
            <div className='grid gap-4 grid-cols-2'>
              <Form.Item name="PermissionType" label="Dokumenta veidnes piederība">
                <SearchSelectInput
                  allowClear
                  options={[
                    {
                      lable: 'Valsts',
                      value: 'Country'
                    },
                    ...supervisors?.map((item: Supervisor) => ({
                      label: item.name,
                      value: item.id,
                      code: item.code
                    }))
                  ]}
                />
              </Form.Item>
              <div className='grid gap-4 grid-cols-2'>
                <Form.Item label="Derīgs no" name="validFrom">
                  <DatePicker format={dateFormat} />
                </Form.Item>
                <Form.Item label="Derīgs līdz" name="validTo">
                  <DatePicker format={dateFormat} />
                </Form.Item>
              </div>
            </div>
            <Form.Item
              name="ResourceTypeId"
              label="Resursa veids"
              rules={[{ required: true, message: "Lūdzu izvēlieties resursa veidu." }]}
            >
              <SearchSelectInput
                options={
                  dataTypes?.filter((type: ClassifierResponse) => type.type === 'resource_type')?.map((item: Parameter) => ({
                    label: item.value,
                    value: item.id,
                    code: item.code
                  }))
                }
                className='sm:!w-[200px]'
              />
            </Form.Item>
            {activeDocumentType !== 'hyperlink' &&
              <Ckeditor
                text={textEditor}
                setText={setTextEditor}
              />
            }
          </Form>
        </Spin>
      }
      {step === 2 &&
        <div dangerouslySetInnerHTML={{ __html: documentTemplate }}></div>
      }
    </Modal>
  )
}

export default DocumentModal
