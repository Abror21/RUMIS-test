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
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).applicationsColumns) {
        return JSON.parse(profileData.configurationInfo).applicationsColumns
      } else {
        return [
          {
            name: 'Pieteikuma numurs',
            key: 'applicationNumber',
            isEnabled: true
          },
          {
            name: 'Datums, laiks',
            key: 'applicationDate',
            isEnabled: true
          },
          {
            name: 'Izglītības iestāde',
            key: 'educationalInstitutionName',
            isEnabled: true
          },
          {
            name: 'Pieteikuma iesniedzējs',
            key: 'submitterPerson',
            isEnabled: true
          },
          {
            name: 'Pieteikuma iesniedzēja p.k.',
            key: 'submitterPersonPk',
            isEnabled: true
          },
          {
            name: 'Iesniedzēja loma',
            key: 'submitterType',
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
            name: 'Resursa veids',
            key: 'resourceType',
            isEnabled: true
          },
          {
            name: 'Resursa paveids',
            key: 'resourceSubType',
            isEnabled: true
          },
          {
            name: 'Sociālais statuss',
            key: 'socialStatus',
            isEnabled: true
          },
          {
            name: 'Pieteikuma statuss',
            key: 'applicationStatus',
            isEnabled: true
          },
          {
            name: 'Pieteikuma kontakttālrunis',
            key: 'contactPerson',
            isEnabled: true
          },
          {
            name: 'Kontakta epasta adrese',
            key: 'contactPersonEmail',
            isEnabled: true
          },
          {
            name: 'Klase/grupa',
            key: 'resourceTargetPersonClassGrade',
            isEnabled: true
          },
          {
            name: 'Izglītības programma',
            key: 'resourceTargetPersonEducationalProgram',
            isEnabled: true
          },
          {
            name: 'Izglītības apakšstatuss',
            key: 'resourceTargetPersonEducationalSubStatus',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja statuss',
            key: 'resourceTargetPersonWorkStatus',
            isEnabled: true
          },
          {
            name: 'Vadoša iestāde',
            key: 'supervisor',
            isEnabled: true
          },
          {
            name: 'P/N akts',
            key: 'applicationResource',
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
        configurationInfo.applicationsColumns = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({applicationsColumns: dataSource})
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