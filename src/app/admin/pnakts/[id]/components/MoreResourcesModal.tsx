import { Resource } from "@/app/types/Resource"
import { AppConfig } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Dispatch, SetStateAction, useState } from "react"
import MoreResourcesFilters from "./MoreResourcesFilters"

type MoreResourcesModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

export type ResourcesFilterType = {
  sort?: string;
  sortDir?: number;
  inventoryNumber?: string,
  modelNameIds?: string,
  manufacturerIds?: string,
  serialNumber?: string,
  educationalInstitution?: string,
  modelIdentifier?: string,
  resourceName?: string,
  page: number;
  take: number;
}

export const initialValues = {
    page: 1,
    take: AppConfig.takeLimit,
  };
const MoreResourcesModal = ({setModalOpen}: MoreResourcesModalProps) => {
    const [filter, setFilter] = useState(initialValues);

    const {
        data: resources,
        appendData: refetchWithUpdatedData,
        refetch,
        isLoading,
      } = useQueryApiClient({
        request: {
          url: '/resources',
          data: filter,
        //   disableOnMount: true
        },
    });

    const columns:ColumnsType<Resource> = [
        {
          title: 'Inventāra Nr.',
          dataIndex: 'inventoryNumber',
          key: 'inventoryNumber',
        },
        {
          title: 'Resursa Nr.',
          dataIndex: 'resourceNumber',
          key: 'resourceNumber',
        },
        {
          title: 'Ražotājs',
          dataIndex: 'manufacturer',
          key: 'manufacturer',
          sorter: true,
          render: (manufacturer: any) => manufacturer.value 
        },
        {
          title: 'Ražotāja nosaukums',
          dataIndex: 'modelName',
          key: 'modelName',
          sorter: true,
          render: (modelName: any, record: Resource) => modelName.value 
        },
        {
          title: 'Sērijas Nr.',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
        },
        {
          title: 'Modelis',
          dataIndex: 'modelIdentifier',
          key: 'modelIdentifier',
          sorter: true,
        },
        {
          title: 'Nosaukums(iestādes)',
          dataIndex: 'resourceName',
          key: 'resourceName',
        },
    ]

    const fetchRecords = (page: number, pageSize: number) => {
      const newPage = page !== filter.page ? page : 1;
      const newFilter = { ...filter, page: newPage, take: pageSize };
        setFilter(newFilter);
        refetchWithUpdatedData(newFilter);
    };

    return (
        <Modal
            open={true}
            title="Resursi"
            onCancel={() => setModalOpen(false)}
            width={900}
        >
            <MoreResourcesFilters 
              activeFilters={filter}
              filterState={setFilter}
              refresh={refetchWithUpdatedData}
            />
            <div className='overflow-auto'>
                <Table
                  scroll={{x: 'max-content'}}
                  style={{wordBreak: 'break-word'}}
                  loading={isLoading}
                  columns={columns}
                  dataSource={resources?.items}
                  pagination={{
                  total: resources?.total,
                  onChange: (page, takeLimit) => {
                      fetchRecords(page, takeLimit);
                  },
                  }}
                  rowKey={(record) => record.id}
                />
            </div>
        </Modal>
    )
}

export default MoreResourcesModal