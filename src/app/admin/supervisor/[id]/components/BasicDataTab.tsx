'use client'

import { Typography } from "antd";
import Link from "next/link";
import {SupervisorView as SupervisorViewType} from '@/app/types/Supervisor'
import { useMemo } from "react";

type BasicDataTabProps = {
    data: SupervisorViewType;
}

const { Title } = Typography;

const BasicDataTab = ({data}: BasicDataTabProps) => {
    const allResourcesLink = `/admin/resources?supervisorIds=${data.id}&resourceStatusIds=214a7d61-e368-4824-ab01-e96bca991e60&resourceStatusIds=ba2aced7-704f-48a1-8bb6-b3d0ba79815c&resourceStatusIds=b083dfcb-5521-4284-8708-ada59075830b&resourceStatusIds=dccdec3e-1b18-4c22-93ba-3d11c06fc911&resourceStatusIds=9b1f9150-7c05-4755-82d7-ef638df57ab6&resourceStatusIds=c65d2c19-a7f5-41ee-918b-6656965316b7`
    const inUsePersonallyResourcesLink = `/admin/resources?supervisorIds=${data.id}&resourceStatusIds=9b1f9150-7c05-4755-82d7-ef638df57ab6&usagePurposeTypeIds=a2b5b9bb-5ea6-4a10-8ed3-8d001b98d6b5`
    const inUseEducationallyResourcesLink = `/admin/resources?supervisorIds=${data.id}&resourceStatusIds=9b1f9150-7c05-4755-82d7-ef638df57ab6&usagePurposeTypeIds=bf04dd8f-56bb-4355-9b72-78a1a1fff587`
    
    const applicationsAcceptedLink = `/admin/applications?supervisorIds=${data.id}&applicationStatusIds=62db47ee-cdee-4580-a519-6b728448c0f1`
    const applicationsAwaitingLink = `/admin/applications?supervisorIds=${data.id}&applicationStatusIds=88c9d616-c76b-49f8-9852-1e970977ee27`
    const applicationsPostponedLink = `/admin/applications?supervisorIds=${data.id}&applicationStatusIds=4f8f8ea3-3e45-44e2-b2c6-348d3ad8c7af`
    
    const allEduLink = `/admin/educational-institutions?supervisorIds=${data.id}`
    const activeEduLink = `/admin/educational-institutions?supervisorIds=${data.id}&educationalInstitutionStatusIds=81715ecf-f8c1-4d7c-913d-76e6a27be851`
    
    const countryDocumentTemplates = `/admin/document-templates`

    const allUsersCount = useMemo(() => {
        return data?.users.length
    }, [data])

    const activeUsersCount = useMemo(() => {
        return data?.users.filter(user => user.isActive).length
    }, [data])
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Title level={4}>Izglītības resursi</Title>
                <div className="flex justify-between pl-2">
                    <div><b>Kopā:</b></div>
                    <div>
                        <Link href={allResourcesLink}>{data.supervisor.activeResources}</Link>
                    </div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Izsniegti individuālai lietošanai:</div>
                    <div><Link href={inUsePersonallyResourcesLink}>{data.supervisor.resourcesInUsePersonally}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Lietošanā iestāde:</div>
                    <div><Link href={inUseEducationallyResourcesLink}>{data.supervisor.resourcesInUseEducationally}</Link></div>
                </div>
            </div>
            <div>
                <Title level={4}>Pieteikumi</Title>
                <div className="flex justify-between pl-2">
                    <div><b>Kopā:</b></div>
                    <div><Link href={'/admin/applications'}>{data.supervisor.applications}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Apstiprināts:</div>
                    <div><Link href={applicationsAcceptedLink}>{data.supervisor.applicationsAccepted}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Izskatīšanā:</div>
                    <div><Link href={applicationsAwaitingLink}>{data.supervisor.applicationsAwaitingResources}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Atlikta izskatīšana:</div>
                    <div><Link href={applicationsPostponedLink}>{data.supervisor.applicationsPostponed}</Link></div>
                </div>
            </div>
            <div>
                <Title level={4}>Izglītības iestādes</Title>
                <div className="flex justify-between pl-2">
                    <div><b>Kopā:</b></div>
                    <div><Link href={allEduLink}>{data.supervisor.educationalInstitutions}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Aktīvas:</div>
                    <div><Link href={activeEduLink}>{data.supervisor.activeEducationalInstitutions}</Link></div>
                </div>
            </div>
            <div>
                <Title level={4}>Dokumenti</Title>
                <div className="flex justify-between pl-2">
                    <div>Pamata veidnes:</div>
                    <div><Link href={countryDocumentTemplates}>{data.supervisor.countryDocumentTemplates}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Vadošās iestādes veidnes:</div>
                    <div><Link href={countryDocumentTemplates}>{data.supervisor.educationalInstitutionsDocumentTemplates}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Vadošās iestādes saites:</div>
                    <div><Link href={countryDocumentTemplates}>{data.supervisor.educationalInstitutionsDocumentLinks}</Link></div>
                </div>
            </div>
            <div>
                <Title level={4}>Administratori</Title>
                <div className="flex justify-between pl-2">
                    <div><b>Kopā:</b></div>
                    <div><Link href={'/admin/users'}>{allUsersCount}</Link></div>
                </div>
                <div className="flex justify-between pl-2">
                    <div>Aktīvas:</div>
                    <div><Link href={'/admin/users'}>{activeUsersCount}</Link></div>
                </div>
            </div>
        </div>
    )
}

export default BasicDataTab