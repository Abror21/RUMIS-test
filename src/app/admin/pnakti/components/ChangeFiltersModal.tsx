import SortableTable, { SortableTableItem } from "@/app/components/SortableTable"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Modal } from "antd"
import { useMemo } from "react"

type ChangeFiltersModalProps = {
  setModalOpen: Function
  profileData: any
  refetchUserProfile: Function
}

const ChangeFiltersModal = ({setModalOpen, profileData, refetchUserProfile}: ChangeFiltersModalProps) => {
    const initialData = useMemo(() => {
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).applicationResourcesFilters) {
        return JSON.parse(profileData.configurationInfo).applicationResourcesFilters
      } else {
        return [
            {
                name: 'Resursa nosaukums',
                key: 'resourceName',
                isEnabled: true
            },
            {
                name: 'Resursa numurs',
                key: 'resourceNumber',
                isEnabled: true
            },
            {
                name: 'Resursa lietotājs',
                key: 'resourceTargetPerson',
                isEnabled: true
            },
            {
                name: 'Saskaņotājs',
                key: 'conciliator',
                isEnabled: true
            },
            {
                name: 'Dokumenta datums',
                key: 'documentDate',
                isEnabled: true
            },
            {
                name: 'Resursa veids',
                key: 'resourceType',
                isEnabled: true
            },
            {
                name: 'Vadoša iestāde',
                key: 'supervisor',
                isEnabled: true
            },
            {
                name: 'Resursa sērijas numurs',
                key: 'serialNumber',
                isEnabled: true
            },
            {
                name: 'Resursa lietotāja tips',
                key: 'resourceTargetPersonTypeIds',
                isEnabled: true
            },
            {
                name: 'Saskaņotājs iestādē',
                key: 'conciliatorEducation',
                isEnabled: true
            },
            {
                name: 'P/N akta statuss',
                key: 'pnaStatus',
                isEnabled: true
            },
            {
                name: 'Resursa paveids',
                key: 'resourceSubTypeIds',
                isEnabled: true
            },
            {
                name: 'Izglītības iestāde',
                key: 'educationalInstitutionIds',
                isEnabled: true
            },
            {
                name: 'Inventāra numurs',
                key: 'inventoryNumber',
                isEnabled: true
            },
            {
                name: 'Atgriešanas datums',
                key: 'returnDate',
                isEnabled: true
            },
            {
                name: 'Izsniegts atšķirīgs',
                key: 'receivedDiffers',
                isEnabled: true
            },
            {
                name: 'Termiņš',
                key: 'assignedResourceReturnDate',
                isEnabled: true
            },
            {
                name: 'Resursa lietotāja statuss',
                key: 'resourceTargetStatus',
                isEnabled: true
            },
            {
                name: 'Atgriešanas statuss',
                key: 'returnResourceStateIds',
                isEnabled: true
            },
            {
                name: 'Resursa lietotāja klase grupa',
                key: 'resourceTargetPersonClass',
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
        configurationInfo.applicationResourcesFilters = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({applicationResourcesFilters: dataSource})
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
              allowSorting={false}
              nameTitle="Meklētāja elements"
            />
        </Modal>
    )
}

export default ChangeFiltersModal