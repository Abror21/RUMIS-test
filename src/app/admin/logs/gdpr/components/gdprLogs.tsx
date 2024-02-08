'use client';

import { Button, DatePicker, Form, Table, Input, Spin } from 'antd';
import { useRef } from 'react';

import {
  dateFilterFormat
} from '@/app/utils/AppConfig';
import { Tabs } from '@/app/admin/logs/components/tabs';
import type { ColumnsType } from 'antd/es/table';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import SearchSelectInput from "@/app/components/searchSelectInput"
import { ClassifierResponse } from '@/app/types/Classifiers';

const { RangePicker } = DatePicker;

type GdprFilter = {
  dateFrom?: string
  dateTo?: string
  reasonId: string
  dataHandlerPrivatePersonalIdentifier: string
  dataOwnerPrivatePersonalIdentifier: string
  notes: string
}

interface GdprType {
  id: string
  action: string
  actionData: string
  created: string
  dataHandler: string
  dataHandlerPrivatePersonalIdentifier: string
  dataOwner: string
  dataOwnerPrivatePersonalIdentifier: string
  processedData: string[]
}

const GdprLogs = () => {
  const [form] = Form.useForm();
  const pageTopRef = useRef(null);

  const fixDate = (date: any, convertDateFormat: string) => {
    return date.format(convertDateFormat);
  };

  const {
    data: logs,
    appendData,
    isLoading,
  } = useQueryApiClient({
    request: {
      url: '/PersonDataReports',
      method: 'POST'
    },
  });

  const {
    data: reasonClassifiers,
  } = useQueryApiClient({
    request: {
      url: `/classifiers/getbytype`,
      data: {
        types: ['personal_data_specialist_reason_for_request'],
        includeDisabled: false
      }
    },
  });

  const dataHandlerPrivatePersonalIdentifier = Form.useWatch('dataHandlerPrivatePersonalIdentifier', form)
  const dataOwnerPrivatePersonalIdentifier = Form.useWatch('dataOwnerPrivatePersonalIdentifier', form)

  const onFinish = (values: any) => {
    const newFilter: GdprFilter = {
      "reasonId": values.reasonId,
      "dataHandlerPrivatePersonalIdentifier": values.dataHandlerPrivatePersonalIdentifier,
      "dataOwnerPrivatePersonalIdentifier": values.dataOwnerPrivatePersonalIdentifier,
      "notes": values.notes
    };

    if (values?.date) {
      newFilter.dateFrom = fixDate(values?.date[0], dateFilterFormat);
      newFilter.dateTo = fixDate(values?.date[1], dateFilterFormat);
    }

    appendData(newFilter);
  };

  const columns: ColumnsType<GdprType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Darbība',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Darbības dati',
      dataIndex: 'actionData',
      key: 'actionData',
    },
    {
      title: 'Izveidots',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Datu apstrādātājs',
      dataIndex: 'dataHandler',
      key: 'dataHandler',
      render: (row: any) => {
        return row?.persons.map((data: any, index: number) => (
          <div key={index}>{data?.firstName} {data?.lastName}</div>
        ))
      }
    },
    {
      title: 'Datu apstrādātāja personas kods',
      dataIndex: 'dataHandlerPrivatePersonalIdentifier',
      key: 'dataHandlerPrivatePersonalIdentifier',
    },
    {
      title: 'Datu īpašnieks',
      dataIndex: 'dataOwner',
      key: 'dataOwner',
      render: (row: any) => {
        return row?.persons.map((data: any, index: number) => (
          <div key={index}>{data?.firstName} {data?.lastName}</div>
        ))
      }
    },
    {
      title: 'Datu īpašnieka personas kods',
      dataIndex: 'dataOwnerPrivatePersonalIdentifier',
      key: 'dataOwnerPrivatePersonalIdentifier',
    },
    {
      title: 'Apstrādātie dati',
      dataIndex: 'processedData',
      key: 'processedData',
      render: (processedData: string[]) => {
        return processedData.map((data: any, index: number) => (
          <div key={index}>{data?.value}</div>
        ))
      }
    }
  ];

  return (
    <div>
      <div ref={pageTopRef}>
        <Tabs active='gdpr' />
        <Form
          form={form}
          name="logs"
          onFinish={onFinish}
          layout="vertical"
          className="flex items-end gap-2"
        >
          <Form.Item
            name="date"
            label="Datums"
          >
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="reasonId"
            label="Iemesls"
            rules={[{ required: true, message: "Iemesls ir obligāts lauks." }]}
          >
            <SearchSelectInput
              style={{ width: 300 }}
              options={
                reasonClassifiers?.map((reason: ClassifierResponse) => ({
                  label: reason.value,
                  value: reason.id,
                }))}
            />
          </Form.Item>
          <Form.Item
            name="dataHandlerPrivatePersonalIdentifier"
            label="Datu apstrādātāja personas kods"
            rules={[
              { pattern: new RegExp(/^\d{11}$/), message: "Atļauts ievadīt tikai 11 ciparus." },
              { required: !dataOwnerPrivatePersonalIdentifier, message: 'Personas kods ir obligāts lauks' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dataOwnerPrivatePersonalIdentifier"
            label="Datu īpašnieka personas kods"
            rules={[
              { pattern: new RegExp(/^\d{11}$/), message: "Atļauts ievadīt tikai 11 ciparus." },
              { required: !dataHandlerPrivatePersonalIdentifier, message: 'Personas kods ir obligāts lauks' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Piezīmes"
            rules={[{ required: true, message: "Piezīmes ir obligāts lauks." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Meklēt
            </Button>
          </Form.Item>
        </Form>
        <Spin spinning={isLoading}>
          {logs.length > 0 &&
            <div className='overflow-auto'>
              <Table
                scroll={{ x: 'max-content' }}
                style={{wordBreak: 'break-word'}}
                loading={isLoading}
                columns={columns}
                dataSource={logs}
                pagination={false}
                rowKey={(record) => record.id}
              />
            </div>
          }
        </Spin>
      </div>
    </div>
  );
};

export { GdprLogs };
