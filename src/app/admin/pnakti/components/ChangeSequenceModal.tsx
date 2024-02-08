import SortableTable, { SortableTableItem } from "@/app/components/SortableTable"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Modal } from "antd"
import { useMemo } from "react"

type ChangeSequenceModalProps = {
  setModalOpen: Function
  profileData: any
  refetchUserProfile: Function
}

const ChangeSequenceModal = ({setModalOpen, profileData, refetchUserProfile}: ChangeSequenceModalProps) => {
    const initialData = useMemo(() => {
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).applicationResourcesColumns) {
        return JSON.parse(profileData.configurationInfo).applicationResourcesColumns
      } else {
        return [
          {
            name: 'Nr.',
            key: 'pnaNumber',
            isEnabled: true
          },
          {
            name: 'Datums',
            key: 'documentDate',
            isEnabled: true
          },
          {
            name: 'Statuss',
            key: 'pnaStatus',
            isEnabled: true
          },
          {
            name: 'Resursa lietotājs',
            key: 'resourceTargetPerson',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja tips',
            key: 'resourceTargetPersonType',
            isEnabled: true
          },
          {
            name: 'Resurss',
            key: 'resource',
            isEnabled: true
          },
          {
            name: 'Sērijas nr.',
            key: 'serialNumber',
            isEnabled: true
          },
          {
            name: 'Resursa nr.',
            key: 'resourceNumber',
            isEnabled: true
          },
          {
            name: 'P/N akta saskaņotājs',
            key: 'submitterPerson',
            isEnabled: true
          },
          {
            name: 'Pieteikums',
            key: 'applicationNumber',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja klase/grupa',
            key: 'resourceTargetPersonClass',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja statuss',
            key: 'resourceTargetPersonStatus',
            isEnabled: true
          },
          {
            name: 'Inventāra numurs',
            key: 'inventoryNumber',
            isEnabled: true
          },
          {
            name: 'Izglītības iestāde',
            key: 'educationalInstitution',
            isEnabled: true
          },
          {
            name: 'Vadoša iestāde',
            key: 'supervisor',
            isEnabled: true
          },
          {
            name: 'Termiņš',
            key: 'assignedResourceReturnDate',
            isEnabled: true
          },
          {
            name: 'Resursa veids',
            key: 'resourceType',
            isEnabled: true
          },
          {
            name: 'Resursa paveids',
            key: 'resourceSubTypeIds',
            isEnabled: true
          },
          {
            name: 'Izsniegts atšķirīgs',
            key: 'issuedDifferent',
            isEnabled: true
          },
          {
            name: 'Atgriešanas datums',
            key: 'returnResourceDate',
            isEnabled: true
          },
          {
            name: 'Atgriešanas statuss',
            key: 'returnResourceState',
            isEnabled: true
          },
        ]
      }
    }, [])

    const {appendData} = useQueryApiClient({
      request: {
        url: `/userProfile/${profileData.id}`,
        method: 'PUT'
      },
      onSuccess: () => {
        setModalOpen(false)
        refetchUserProfile()
      }
    });

    const handleSubmit = (dataSource: SortableTableItem) => {
      let configurationInfo
      if (profileData.configurationInfo) {
        configurationInfo = JSON.parse(profileData.configurationInfo)
        configurationInfo.applicationResourcesColumns = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({applicationResourcesColumns: dataSource})
      }
      appendData({
        ...profileData,
        roleIds: profileData.roles.map((role: any) => role.id),
        educationalInstitutionId: profileData.educationalInstitution?.id,
        supervisorId: profileData.supervisor?.id,
        institutionId: profileData.institutionId?.id,
        configurationInfo: configurationInfo
      })
    }

    return (
        <Modal
            open={true}
            footer={false}
            onCancel={() => setModalOpen(false)}
        >
            <SortableTable 
              initialData={initialData} 
              onCancel={() => setModalOpen(false)}
              onSubmit={(dataSource: SortableTableItem) => handleSubmit(dataSource)}  
            />
        </Modal>
    )
}

export default ChangeSequenceModal