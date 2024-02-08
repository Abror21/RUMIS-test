'use client';

import { Dispatch, SetStateAction, useMemo } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import {
  Form,
  Typography,
  Space,
  Input,
  Button,
  DatePicker,
  Upload,
  FormInstance,
} from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { datePickerFormat } from '@/app/utils/AppConfig';
import locale from 'antd/es/date-picker/locale/lv_LV';

import 'dayjs/locale/lv';

const { Title, Text } = Typography;

type TResourceJustificationSectionProps = {
    fileList: UploadFile[];
    setFileList: Dispatch<SetStateAction<UploadFile[]>>;
    form: FormInstance;
}
const ResourceJustificationSection = ({fileList, setFileList, form}: TResourceJustificationSectionProps) => {
    const uploadProps = useMemo(
        () => ({
          beforeUpload: (file: UploadFile) => {
            setFileList((state) => [file]);
            return false;
          },
          onRemove: (file: UploadFile) => {
            if (fileList.some((item) => item.uid === file.uid)) {
              setFileList((fileListItems) =>
                fileListItems.filter((item) => item.uid !== file.uid),
              );
              form.setFieldValue('documentFile', undefined)
              return false;
            }
            return false;
          },
          maxCount: 1,
          fileList: fileList
        }),
        [fileList],
    );

    return (
        <>
        <Title level={4}>Pieteikuma pamatojums</Title>
          <Form.Item className='!mb-0'>
            <div className='flex flex-col sm:flex-row gap-2'>
              <Form.Item
                name="documentNr"
                label="Dokumenta nr."
                rules={[{required: true, message:"Lūdzu ievadiet dokumenta nr." }]}
                className='!mb-0'
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="documentDate"
                label="Dokumenta datums"
                rules={[{required: true, message:"Lūdzu izvēlieties dokumenta datumu."}]}
                className='w-full sm:w-auto !mb-0'
              >
                <DatePicker format={datePickerFormat} className='w-full' placeholder='Ievadiet datumu' locale={locale}/>
              </Form.Item>
              <Form.Item 
                name="documentFile" 
                rules={[{ required: true, message: "Lūdzu pievieno failu." }]} 
                className='application-document !pt-[4px] sm:!pt-[30px]'
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Izvēlēties failu</Button>
                </Upload>
              </Form.Item>
            </div>
          </Form.Item>
        </>
    )
}

export default ResourceJustificationSection