import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ClassifierTermType } from "@/app/admin/classifiers/components/classifierTerms"
import { getArrayDifference } from '@/app/utils/utils';

type termParamModalProps = {
  parentTableData: ClassifierTermType[],
  resourceParameters: ClassifierTermType[],
  activeGroupId: String,
  hideModal: Function,
  setActiveGroup: Function,
  setParentTableData: Function
}

const tableColumns: ColumnsType<ClassifierTermType> = [
  {
    title: 'Nosaukums',
    dataIndex: 'value',
  }
];

const TermParamModal = ({ activeGroupId, hideModal, resourceParameters, setActiveGroup, parentTableData, setParentTableData }: termParamModalProps) => {
  const initialSelectedRowKeys = useMemo(() => {
    const activeGroup = parentTableData.find(data => data.id === activeGroupId)

    if (activeGroup) {
      return activeGroup.parameters ? activeGroup.parameters.map(param => (param.id)) : []
    }

    return []
  }, [])
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(initialSelectedRowKeys);
  const [activeGroupObject, setActiveGroupObject] = useState<ClassifierTermType | undefined>(() => {
    return parentTableData.find((row: ClassifierTermType) => row.id === activeGroupId)
  });

  useEffect(() => {
    for (let index = 0; index < parentTableData.length; index++) {
      if (activeGroupObject && parentTableData[index].id === activeGroupId) {
        parentTableData[index] = activeGroupObject
      }
    }
    setParentTableData(parentTableData)
  }, [activeGroupObject])

  const paramModalCancel = () => {
    hideModal(false)
    setActiveGroup('')
    // setSelectedRowKeys(payload.map((item: ClassifierTermType) => item.id))
  }

  return (
    <Modal
      title={'Resursa parametrs'}
      centered
      open={true}
      onCancel={() => paramModalCancel()}
      footer={[
        <Button key="back" onClick={() => paramModalCancel()}>
          Atcelt
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            if (selectedRowKeys.length > 0 && activeGroupObject) {
              const selectedRowObject: ClassifierTermType[] = selectedRowKeys.map(id => {
                return resourceParameters.find((row: ClassifierTermType) => row.id === id) as ClassifierTermType
              })

              if (activeGroupObject?.parameters && activeGroupObject?.parameters.length > 0) {
                const diff: ClassifierTermType[] = getArrayDifference(selectedRowObject, activeGroupObject?.parameters)
                if (diff.length > 0 && activeGroupObject !== undefined) {
                  const parameters: ClassifierTermType[] = [...activeGroupObject.parameters, ...diff]

                  activeGroupObject.parameters = parameters
                }
              }
              else {
                activeGroupObject.parameters = selectedRowObject
              }

              setActiveGroupObject({ ...activeGroupObject})
            }
            hideModal(false)
            setActiveGroup('')
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
        dataSource={resourceParameters}
        pagination={false}
        rowKey={(record) => record.id}
      />
    </Modal>
  )
}

export default TermParamModal
