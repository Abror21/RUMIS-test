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
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).resourceColumns) {
        return JSON.parse(profileData.configurationInfo).resourceColumns
      } else {
        return [
            {
                name: 'Resursa kods',
                key: 'resourceNumber',
                isEnabled: true
            },
            {
                name: 'Sērijas Nr.',
                key: 'serialNumber',
                isEnabled: true
            },
            {
                name: 'Inventāra Nr.',
                key: 'inventoryNumber',
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
                name: 'Ražotāja nosaukums',
                key: 'manufacturerName',
                isEnabled: true
            },
            {
                name: 'Modelis',
                key: 'modelName',
                isEnabled: true
            },
            {
                name: 'Resursa paveids',
                key: 'resourceSubType',
                isEnabled: true
            },
            {
                name: 'Statuss',
                key: 'resourceStatus',
                isEnabled: true
            },
            {
                name: 'Atrašanās vieta',
                key: 'resourceLocation',
                isEnabled: true
            },
            {
                name: 'Resursa veids',
                key: 'resourceType',
                isEnabled: true
            },
            {
                name: 'Ražošanas gads',
                key: 'manufactureYear',
                isEnabled: true
            },
            {
                name: 'Resursu grupa',
                key: 'resourceGroup',
                isEnabled: true
            },
            {
                name: 'Vadoša iestāde',
                key: 'resourceType',
                isEnabled: true
            },
            {
                name: 'Izglītības iestāde',
                key: 'educationalInstitution',
                isEnabled: true
            },
            {
                name: 'Iegādes veids',
                key: 'acquisitionType',
                isEnabled: true
            },
            {
                name: 'Sociālā atbalsta resurss',
                key: 'socResurss',
                isEnabled: true
            },
            {
                name: 'Izmantošanas mērķis',
                key: 'usagePurposeType',
                isEnabled: true
            },
            {
                name: 'Mērķa grupa',
                key: 'targetGroup',
                isEnabled: true
            },
            {
                name: 'Iegādes vērtība (ar PVN)',
                key: 'acquisitionsValue',
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
        configurationInfo.resourceColumns = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({resourceColumns: dataSource})
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
            />
        </Modal>
    )
}

export default ChangeSequenceModal