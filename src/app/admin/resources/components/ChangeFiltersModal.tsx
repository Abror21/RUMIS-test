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
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).resourceFilters) {
        return JSON.parse(profileData.configurationInfo).resourceFilters
      } else {
        return [
            {
                name: 'Resursa kods',
                key: 'resourceNumber',
                isEnabled: true
            },
            {
                name: 'Inventāra Nr.',
                key: 'inventoryNumber',
                isEnabled: true
            },
            {
                name: 'Sērijas Nr.',
                key: 'serialNumber',
                isEnabled: true
            },
            {
                name: 'Iestādes piešķirtais nosaukums',
                key: 'resourceName',
                isEnabled: true
            },
            {
                name: 'Ražotājs',
                key: 'manufacturer',
                isEnabled: true
            },
            {
                name: 'Resursa statuss',
                key: 'resourceStatus',
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
                name: 'Resursa grupa',
                key: 'resourceGroup',
                isEnabled: true
            },
            {
                name: 'Izmantošanas mērķis',
                key: 'resourceUsingPurpose',
                isEnabled: true
            },
            {
                name: 'Mērķa grupa',
                key: 'targetGroup',
                isEnabled: true
            },
            {
                name: 'Atrašanās vieta',
                key: 'resourceLocation',
                isEnabled: true
            },
            {
                name: 'Vadošā iestāde',
                key: 'supervisor',
                isEnabled: true
            },
            {
                name: 'Izglītības iestāde',
                key: 'educationalInstitutionIds',
                isEnabled: true
            },
            {
                name: 'Modelis',
                key: 'modelIdentifier',
                isEnabled: true
            },
            {
                name: 'Resursa nosaukums',
                key: 'modelNameIds',
                isEnabled: true
            },
            {
                name: 'Iegādes veids',
                key: 'acquisitionTypeIds',
                isEnabled: true
            },
            {
                name: 'Sociālā atbalsta resurss',
                key: 'socialSupportResource',
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

    const handleSubmit = (dataSource: SortableTableItem[]) => {
      let configurationInfo
      if (profileData.configurationInfo) {
        configurationInfo = JSON.parse(profileData.configurationInfo)
        configurationInfo.resourceFilters = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({resourceFilters: dataSource})
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
              onSubmit={(dataSource: SortableTableItem[]) => handleSubmit(dataSource)}
              allowSorting={false}
              nameTitle="Meklētāja elements"
            />
        </Modal>
    )
}

export default ChangeFiltersModal