import { ParsedResourceSocialSupportReport, ResourceReportFilters, ResourceSocialSupportReport } from "@/app/types/Report";
import { mmDdYyFormat } from "@/app/utils/AppConfig";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { createReportResourcesBySocialSupportResourceExcelFile, goToUrl } from "@/app/utils/utils";
import { Button, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react"
import ResourceReportsFilters from "../ResourceReportsFilters";
import React from "react";
import Link from "next/link";

const ResourcesBySocialSupportResource = () => {
    const [reportData, setReportData] = useState<ParsedResourceSocialSupportReport[]>([])
    
    const {data: sessionData} = useSession();
    const router = useRouter();

    if (!sessionData?.user) {
        goToUrl('/', router)
        return
    }
    
    const {permissionType, educationalInstitutionId, supervisor} = sessionData?.user
    const initialFilters = {
        date: dayjs().format(mmDdYyFormat),
        educationalInstitutionId: educationalInstitutionId ?? undefined,
        supervisorId: supervisor ?? undefined,
    }
    const [filter, setFilter] = useState<ResourceReportFilters>(initialFilters);

    const {
        appendData,
        refetch,
        isLoading,
    } = useQueryApiClient({
        request: {
            url: '/reports/resourcesBySocialSupportResource',
            data: filter,
        },
        onSuccess: (response: ResourceSocialSupportReport[]) => {
            const data: any[] = []

            response.map(item => {
                if (data?.some(i => i.educationalInstitutionId === item.educationalInstitution.id)) {
                    const index = data?.findIndex(i => i.educationalInstitutionId === item.educationalInstitution.id)
                    
                    if (data[index].types.some((s: any) => s.code === item.resourceType.code)) {
                        const typeIndex = data[index].types.findIndex((s: any) => s.code === item.resourceType.code)
                        
                        data[index].types[typeIndex][item.resourceStatus.code] += item.resourceCount

                        if (item.socialSupportResource) {
                            data[index].types[typeIndex].socialSupport[item.resourceStatus.code] += item.resourceCount
                        }
                    } else {
                        data[index].types.push({
                            ...item.resourceType,
                            new: 0,
                            available: 0,
                            reserved: 0,
                            in_use: 0,
                            maintenance: 0,
                            under_repair: 0,
                            [item.resourceStatus.code]: item.resourceCount,
                            socialSupport: {
                                new: 0,
                                available: 0,
                                reserved: 0,
                                in_use: 0,
                                maintenance: 0,
                                under_repair: 0,
                                ...(item.socialSupportResource
                                    ? { [item.resourceStatus.code]: item.resourceCount }
                                    : {}),
                            }
                        })
                    }
                } else {
                    data.push({
                        educationalInstitutionName: item.educationalInstitution.name,
                        educationalInstitutionId: item.educationalInstitution.id,
                        types: [{
                            ...item.resourceType,
                            new: 0,
                            available: 0,
                            reserved: 0,
                            in_use: 0,
                            maintenance: 0,
                            under_repair: 0,
                            [item.resourceStatus.code]: item.resourceCount,
                            socialSupport: {
                                new: 0,
                                available: 0,
                                reserved: 0,
                                in_use: 0,
                                maintenance: 0,
                                under_repair: 0,
                                ...(item.socialSupportResource
                                    ? { [item.resourceStatus.code]: item.resourceCount }
                                    : {}),
                            }
                        }]
                    })
                }
            })

            setReportData(data)
        }
    })

    return (
        <div className="flex flex-col gap-y-[10px]">
            <ResourceReportsFilters 
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: ResourceReportFilters) => {
                    appendData(newFilters)
                }}
                permissionType={permissionType}
                initialFilters={initialFilters}
            />
            <div className="bg-white rounded-lg p-6">
                <div className='overflow-auto'>
                    <Spin spinning={isLoading}>
                        <div className='flex justify-end mb-2'>
                            <Button type='primary' onClick={() => {createReportResourcesBySocialSupportResourceExcelFile(reportData)}}>Eksportēt sarakstu</Button>
                        </div>
                    </Spin>
                    <table className="w-full reports-table">
                        <colgroup>
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                            <col />
                        </colgroup>
                        <tbody>
                            <tr className="bg-[#fafafa]">
                                <th
                                    style={{ textAlign: "center", verticalAlign: "middle" }}
                                    colSpan={2}
                                    rowSpan={2}
                                    scope="colgroup"
                                    className="confluenceTh"
                                >
                                    Resurss
                                </th>
                                <th
                                    style={{ textAlign: "center" }}
                                    colSpan={6}
                                    scope="colgroup"
                                    className="confluenceTh"
                                >
                                    <strong>Statuss</strong>
                                </th>
                            </tr>
                            <tr className="bg-[#fafafa]">
                                <th scope="col" className="confluenceTh">
                                    Jauns
                                </th>
                                <th scope="col" className="confluenceTh">
                                    Pieejams izsniegšanai
                                </th>
                                <th scope="col" className="confluenceTh">
                                    Rezervēts
                                </th>
                                <th scope="col" className="confluenceTh">
                                    Lietošanā
                                </th>
                                <th scope="col" className="confluenceTh">
                                    Apkopē
                                </th>
                                <th scope="col" className="confluenceTh">
                                    Remontā
                                </th>
                            </tr>
                            {reportData.map((data, index) => (
                                    <React.Fragment key={`${data.educationalInstitutionName}-${index}`}>
                                        <tr className="">
                                            <td colSpan={6} className="confluenceTd"><Link href={`/admin/resources?educationalInstitution=${data.educationalInstitutionId}`}>{data.educationalInstitutionName}</Link><strong><br/></strong></td>
                                        </tr>
                                        {data.types.map(type => (
                                            <React.Fragment key={`${type.code}`}>
                                                <tr className="">
                                                    <td className="confluenceTd align-top" rowSpan={2}><Link href={`/admin/resources?educationalInstitution=${data.educationalInstitutionId}`}><u>{type.value}</u></Link></td>
                                                    <td className="confluenceTd text-end"><strong>Kopā</strong></td>
                                                    <td className="confluenceTd text-center">{type?.new ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.available ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.reserved ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.in_use ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.maintenance ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.under_repair ?? 0}</td>
                                                </tr>
                                                <tr className="">
                                                    <td className="confluenceTd text-end">Sociālā atbalsta resurss</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.new ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.available ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.reserved ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.in_use ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.maintenance ?? 0}</td>
                                                    <td className="confluenceTd text-center">{type?.socialSupport.under_repair ?? 0}</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                            ))}
                           {(!reportData.length && !isLoading) &&
                                <tr><td colSpan={9}><Empty description={'Nav datu'} /></td></tr>
                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    )
}

export default ResourcesBySocialSupportResource