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
      if (profileData.configurationInfo && JSON.parse(profileData.configurationInfo).applicationsFilters) {
        return JSON.parse(profileData.configurationInfo).applicationsFilters
      } else {
        return [
          {
            name: 'Resursa lietotājs',
            key: 'resourceTargetPerson',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja tips',
            key: 'resourceTargetPersonTypeIds',
            isEnabled: true
          },
          {
            name: 'Pieteikuma iesniedzējs',
            key: 'submitterPerson',
            isEnabled: true
          },
          {
            name: 'Resursa veids',
            key: 'resourceType',
            isEnabled: true
          },
          {
            name: 'Pieteikuma statuss',
            key: 'applicationStatusIds',
            isEnabled: true
          },
          {
            name: 'Vadošā iestāde',
            key: 'supervisor',
            isEnabled: true
          },
          {
            name: 'Iesniegšanas periods',
            key: 'applicationDate',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja statuss',
            key: 'workEducationStatus',
            isEnabled: true
          },
          {
            name: 'Pieteikuma iesniedzēja loma',
            key: 'resourceSubTypeIds',
            isEnabled: true
          },
          {
            name: 'Resursa paveids',
            key: 'submitterTypeIds',
            isEnabled: true
          },
          {
            name: 'Sociālais statuss',
            key: 'applicationSocialStatusIds',
            isEnabled: true
          },
          {
            name: 'Izglītības iestāde',
            key: 'educationalInstitutionIds',
            isEnabled: true
          },
          {
            name: 'Pieteikuma numurs',
            key: 'applicationNumber',
            isEnabled: true
          },
          {
            name: 'Kontakttālrunis',
            key: 'contactPhone',
            isEnabled: true
          },
          {
            name: 'Kontakta epasts',
            key: 'contactEmail',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja izglītības programma',
            key: 'resourceTargetPersonEducationalProgram',
            isEnabled: true
          },
          {
            name: 'Izglītības apakšstatuss',
            key: 'resourceTargetPersonEducationalSubStatus',
            isEnabled: true
          },
          {
            name: 'Pazīme par analoģisku resursa paveidu',
            key: 'hasDuplicate',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja atbilstība sociālajai statusa grupai',
            key: 'applicationSocialStatusApprovedIds',
            isEnabled: true
          },
          {
            name: 'Resursa lietotāja klase/grupa',
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

    const handleSubmit = (dataSource: SortableTableItem[]) => {
      let configurationInfo
      if (profileData.configurationInfo) {
        configurationInfo = JSON.parse(profileData.configurationInfo)
        configurationInfo.applicationsFilters = dataSource
        configurationInfo = JSON.stringify(configurationInfo)
      } else {
        configurationInfo = JSON.stringify({applicationsFilters: dataSource})
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