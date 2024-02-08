import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';
import { Button, Checkbox, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Image from 'next/image';

export type SortableTableItem =  {
    key: string;
    name: string;
    isEnabled: boolean;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = (props: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};

type SortableTableProps = {
  initialData: SortableTableItem[]
  onCancel: Function
  onSubmit: Function
  allowSorting?: boolean
  nameTitle?: string
}
const SortableTable = ({initialData, onCancel, onSubmit, allowSorting = true, nameTitle = 'Kolonnas nosaukums'}: SortableTableProps) => {
    const [dataSource, setDataSource] = useState<SortableTableItem[]>(initialData);

    const defaultColumns: ColumnsType<SortableTableItem> = [
      {
        render: () => <Image src="/assets/images/move.png" width={16} height={16} alt='vilkt, lai pārkārtotu'/>,
      },
      {
        title: nameTitle,
        dataIndex: 'name',
      },
      {
        title: 'Attēlot',
        dataIndex: 'isEnabled',
        render: (value: boolean, record: any) => <Checkbox checked={value} onChange={() => handleEnabledCheckbox(record.key, !value)}></Checkbox>
      },
    ];

    const columns: ColumnsType<SortableTableItem> = allowSorting ? defaultColumns : defaultColumns.slice(1)

    const handleEnabledCheckbox = (key: string, isEnabled: boolean) => {
      setDataSource(prevItems => {
        return prevItems.map(item => {
          if (item.key === key) {
            return { ...item, isEnabled: isEnabled }
          }
          return item
        });
      });
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 1,
          },
        }),
    );

    const onDragEnd = ({ active, over }: DragEndEvent) => {
      if (active.id !== over?.id) {
        setDataSource((prev) => {
          const activeIndex = prev.findIndex((i) => i.key === active.id);
          const overIndex = prev.findIndex((i) => i.key === over?.id);
          return arrayMove(prev, activeIndex, overIndex);
        });
      }
    };
    return (
      <>
      {allowSorting ?
        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            items={dataSource.map((i) => i.key)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              components={{
                body: {
                  row: Row,
                },
              }}
              rowKey="key"
              columns={columns}
              dataSource={dataSource}
              pagination={false}
            />
          </SortableContext>
        </DndContext>
      :
        <Table
          rowKey="key"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      }
        <div className='flex justify-end gap-2 mt-4'>
            <Button onClick={() => onCancel()}>Atcelt</Button>
            <Button type='primary' onClick={() => onSubmit(dataSource)}>Saglabāt</Button>
        </div>
      </>
    )
}

export default SortableTable
