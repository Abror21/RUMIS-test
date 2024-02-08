import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Checkbox, Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { ColumnsType } from 'antd/es/table';
import { ClassifierTermType } from './classifierTerms';

type ParamDragTableProps = {
  dataSource: any,
  setDataSource: Function,
  recordId: string
}
const ParamDragTable = ({dataSource, setDataSource, recordId}: ParamDragTableProps) => {
  const moveParameters = (parameters: any[], active: DragEndEvent['active'], over: DragEndEvent['over']) => {
    const activeIndex = parameters.findIndex((i) => i.id === active.id);
    const overIndex = parameters.findIndex((i) => i.id === over?.id);

    return arrayMove(parameters, activeIndex, overIndex)
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous: any[]) => previous.map(prev => prev.id === recordId ? {
        ...prev,
        parameters: moveParameters(prev.parameters, active, over)
      } : prev));
    }
  };

  const removeParameter = (id: string) => {
    setDataSource((previous: any[]) => previous.map(prev => prev.id === recordId ? {
      ...prev,
      parameters: prev.parameters.filter((p: any) => p.id !== id)
    } : prev));
  }

  const toggleIsRequiredParameter = (id: string) => {
    setDataSource((previous: any[]) => previous.map(prev => prev.id === recordId ? {
      ...prev,
      parameters: prev.parameters.map((p: any) => (p.id === id ? {
        ...p,
        isRequired: !p.isRequired
      } : p))
    } : prev));
  }

  const ParamRow = ({ children, ...props }: any) => {
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
    delete propsClone.removeParam
  
    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
      transition,
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
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
          // if ((child as React.ReactElement).key === 'isRequired') {
          //   return React.cloneElement(child as React.ReactElement, {
          //     children: (<Checkbox onChange={() => toggleIsRequiredParameter()}/>),
          //   });
          // }
          if ((child as React.ReactElement).key === 'name') {
            if (props?.className && !props.className.includes('ant-table-row-level-1')) {
              return React.cloneElement(child as React.ReactElement, {
                children: (
                  props.title
                ),
              });
            }
          }
          return child;
        })}
      </tr>
    );
  };

  const paramColumns: ColumnsType<ClassifierTermType> = [
    {
      key: 'sort',
      width: "7%",
    },
    {
      title: '',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Obligāts',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: "20%",
      render: (_, record) => <Checkbox onChange={() => toggleIsRequiredParameter(record.id)} checked={record.isRequired}/>
    },
    {
      title: "",
      width: "25%",
      dataIndex: 'remove',
      key: 'remove',
      render: (_, record) => <Button danger icon={<DeleteOutlined />} onClick={() => removeParameter(record.id)}/>
    },
  ];

  return (

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
            };
          }}
          components={{
            body: {
              row: ParamRow,
            }
          }}
          rowKey={(record) => record.id}
          columns={paramColumns}
          dataSource={dataSource}
          pagination={false}
        />
      </SortableContext>
    </DndContext>
  )
}

export default ParamDragTable
