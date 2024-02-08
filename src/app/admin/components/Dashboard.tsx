'use client'

import { useSession } from "next-auth/react"
import ApplicationDynamicDiagram from "./diagrams/ApplicationDynamicDiagram"
import OpenedApplicationsDiagram from "./diagrams/OpenedApplicationsDiagram"
import ResourceDiagram from "./diagrams/ResourceDiagram"
import SubmittedApplicationTop from "./lists/SubmittedApplicationTop"

const Dashboard = () => {
    const {data: session} = useSession()

    const permissions: string[] = session?.user?.permissions || []

    const applicationViewPermission = permissions.includes('application.view')
    const resourceViewPermission = permissions.includes('resource.view')

    return (
        <div className="grid grid-cols-2 gap-y-10">
            {applicationViewPermission && <OpenedApplicationsDiagram />}
            {(session && session?.user?.permissionType !== 'EducationalInstitution' && applicationViewPermission) && <SubmittedApplicationTop permissionType={session?.user?.permissionType as string}/>}
            {(session && session?.user?.permissionType !== 'EducationalInstitution' && applicationViewPermission) && <ApplicationDynamicDiagram />}
            {resourceViewPermission && <ResourceDiagram />}
        </div>
    )
}

export default Dashboard