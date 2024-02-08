import { DragOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useEffect } from 'react';
import TermParamModal from "@/app/admin/classifiers/components/termParamModal"
import { Table, Typography, Checkbox, Button, Modal, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getArrayDifference } from '@/app/utils/utils';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { ClassifierTermType } from "@/app/admin/classifiers/components/classifierTerms"
import ParamDragTable from "@/app/admin/classifiers/components/paramDragTable"

const { Title } = Typography;

const columns: ColumnsType<ClassifierTermType> = [
  {
    key: 'sort',
    width: "7%",
  },
  {
    title: 'Nosaukums',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: "",
    width: "25%",
    dataIndex: 'delete',
    key: 'delete'
  },
];

const tableColumns: ColumnsType<ClassifierTermType> = [
  {
    title: 'Nosaukums',
    dataIndex: 'value',
  }
];

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
  showModal?: Function;
  removeGroup?: Function;
  setActiveGroup?: Function;
  cid: string;
}

const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const propsClone = { ...props }
  delete propsClone.showModal
  delete propsClone.removeGroup
  delete propsClone.setActiveGroup

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const items = () => {
    return {
      items: [
        {
          key: '1',
          label: (
            <button
              type="button"
              onClick={() => {
                if (props.removeGroup) {
                  props.removeGroup(props.cid)
                }
              }}
            >
              Dzēst
            </button>
          ),
        },
      ],
    };
  };

  return (
    <tr {...propsClone} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <DragOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            ),
          });
        }
        if ((child as React.ReactElement).key === 'delete') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <>
                {(props?.className && !props.className.includes('ant-table-row-level-0')) ?
                  <Button danger icon={<DeleteOutlined />} />
                :
                  <Dropdown.Button
                    onClick={() => {
                      if (props.showModal && props.setActiveGroup) {
                        props.showModal(true)
                        props.setActiveGroup(props.cid)
                      }
                    }}
                    menu={items()}
                  >
                    Pievienot parametru
                  </Dropdown.Button>
                }
              </>
            ),
          });
        }
        if ((child as React.ReactElement).key === 'required') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <>
                {(props?.className && !props.className.includes('ant-table-row-level-0')) &&
                  <Checkbox />
                }
              </>
            ),
          });
        }
        if ((child as React.ReactElement).key === 'name') {
          if (props?.className && !props.className.includes('ant-table-row-level-1')) {
            return React.cloneElement(child as React.ReactElement, {
              children: (
                <b>{props.title}</b>
              ),
            });
          }
        }
        return child;
      })}
    </tr>
  );
};

interface ParamRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
  removeParam?: Function;
  cid: string;
}

type TermParamsProps = {
  payload: ClassifierTermType[],
  setPayload: Function
}

const ClassifierPayload = ({ setPayload, payload }: TermParamsProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [paramModalOpen, setParamModalOpen] = useState<boolean>(false);
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [dataSource, setDataSource] = useState<ClassifierTermType[]>(payload);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(() => {
    return payload.map((item:ClassifierTermType) => item.id)
  });

  useEffect(() => {
    setPayload(dataSource)
  }, [dataSource])

  const {
    data: resourceParameterGroups
  } = useQueryApiClient({
    request: {
      url: `/classifiers`,
      data: {
        type: 'resource_parameter_group',
        includeDisabled: true
      }
    },
  });

  const {
    data: resourceParameters
  } = useQueryApiClient({
    request: {
      url: `/classifiers`,
      data: {
        type: 'resource_parameter',
        includeDisabled: true
      }
    },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous: ClassifierTermType[]) => {
        const activeIndex = previous.findIndex((i) => i.id === active.id);
        const overIndex = previous.findIndex((i) => i.id === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const removeGroup = (id: string) => {
    const newGroups = dataSource.filter(item => item.id !== id)
    setDataSource(newGroups)
  }

  const groupModalCancel = () => {
    setModalOpen(false)
    setSelectedRowKeys(payload.map((item: ClassifierTermType) => item.id))
  }

  return (
    <div>
      <Title level={5}>Tehniskie parametri</Title>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={dataSource.map((i: any) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table
            onRow={(record) => {
              return {
                title: record.value,
                cid: record.id,
                removeGroup: removeGroup,
                showModal: setParamModalOpen,
                setActiveGroup: setActiveGroup
              };
            }}
            components={{
              body: {
                row: Row,
              },
            }}
            expandable={{
              columnWidth: '5%',
              defaultExpandAllRows: true,
              rowExpandable: (record) => {
                if(record?.parameters && record.parameters?.length > 0) {
                  return true
                }
                return false
              },
              expandedRowRender: (record) => (
                <ParamDragTable dataSource={record.parameters} setDataSource={setDataSource} recordId={record.id}/>
              )
            }}
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
        </SortableContext>
      </DndContext>
      <Button className='mt-4 mb-5' onClick={() => setModalOpen(true)}>Pievienot grupu</Button>
      <Modal
        title={'Resursa parametra grupa'}
        centered
        open={modalOpen}
        onCancel={groupModalCancel}
        footer={[
          <Button key="back" onClick={groupModalCancel}>
            Atcelt
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if(selectedRowKeys.length > 0) {
                const selectedRowObject: ClassifierTermType[] = selectedRowKeys.map(id => {
                  return resourceParameterGroups.find((row: ClassifierTermType) => row.id === id)
                })
                const sortedSelectedRowObject = selectedRowKeys.map(key =>
                  selectedRowObject.find(obj => obj.id === key)
                );

                const parsedDataSources = sortedSelectedRowObject.map(obj => {
                  const found = dataSource.find(o => o.id === obj?.id)
                  if (found) {
                    return {
                      ...obj,
                      parameters: found.parameters ?? []
                    }
                  } else {
                    return {
                      ...obj,
                      parameters: []
                    }
                  }
                })
                
              setDataSource(parsedDataSources as ClassifierTermType[])
              } else {
                setDataSource([])
              }
              setModalOpen(false)
            }}
          >
            Pievienot
          </Button>,
        ]}
      >
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[]) => {
              setSelectedRowKeys(newSelectedRowKeys);
            }
          }}
          columns={tableColumns}
          dataSource={resourceParameterGroups}
          pagination={false}
          rowKey={(record) => record.id}
        />
      </Modal>
      {paramModalOpen &&
        <TermParamModal
          activeGroupId={activeGroup}
          setActiveGroup={setActiveGroup}
          hideModal={setParamModalOpen}
          parentTableData={dataSource}
          resourceParameters={resourceParameters}
          setParentTableData={setDataSource}
        />
      }
    </div>
  )
}

export default ClassifierPayload
