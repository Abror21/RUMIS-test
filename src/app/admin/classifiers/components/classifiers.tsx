'use client';

import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import useQueryApiClient from '@/app/utils/useQueryApiClient';
import LinkButton from '@/app/components/LinkButton';

const { Title } = Typography;

export interface ClassifierListTermType {
  id: number;
  code: string;
  name: string;
}

interface DataType {
  id: string;
  value: string;
  code: string;
  payload: string;
  items?: DataType[];
}

const Classifiers = () => {
  const [classifiers, setClassifiers] = useState([]);
  const router = useRouter();

  useQueryApiClient({
    request: {
      url: '/classifiers/getByType',
      method: 'GET',
      data: {
        types: ['classifier_type', 'classifier_group'],
        includeDisabled: true,
      },
      enableOnMount: true,
    },
    onSuccess: (response) => {
      const groups = response.filter((t: any) => t.type === 'classifier_group');

      const types = response
        .filter((t: any) => t.type === 'classifier_type')
        .map((t: any) => {
          let group: any;

          if (t.payload) {
            try {
              const payload: { group: string } = JSON.parse(t.payload);

              group = groups.some((n: any) => n.code === payload.group)
                ? payload.group
                : undefined;
            } catch (err) {

            }
          }

          return {
            data: t,
            group,
          };
        });

      groups.forEach((g: any) => {
        g.items = types.filter((t: any) => t.group === g.code).map((t: any) => t.data);
      });

      // ungrouped items
      groups.push({
        data: undefined,
        items: types.filter((t: any) => !t.group).map((t: any) => t.data),
      });

      setClassifiers(groups.filter((t: any) => t.items.length));
    },
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Nosaukums',
      dataIndex: 'value',
      key: 'value',
      width: '80%',
    },
    {
      title: 'Darbības',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record: DataType) => (
        <LinkButton
          href={`/admin/classifiers/${record.code}`}
        >
          Skatīt sarakstu
        </LinkButton>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg">
      {classifiers.map((group: DataType) => (
        <div key={group.id}>
          <Title level={2}>{group.value}</Title>
          <div className='overflow-auto'>
            <Table
              scroll={{x: 'max-content'}}
              style={{wordBreak: 'break-word'}}
              columns={columns}
              dataSource={group.items}
              rowKey={(record) => record.id}
              pagination={false}
              className="mb-8"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export { Classifiers };
