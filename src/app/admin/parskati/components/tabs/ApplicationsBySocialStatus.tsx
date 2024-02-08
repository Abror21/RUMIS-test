'use client'

import { ReportFilters, SocialStatusReport } from "@/app/types/Report";
import { mmDdYyFormat } from "@/app/utils/AppConfig";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { Button, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import ReportsFilters from "../ApplicationReportsFilters";
import { createReportApplicationsBySocialStatusExcelFile, goToUrl } from "@/app/utils/utils";
import { useRouter } from "next/navigation";

const ApplicationsBySocialStatus = () => {
    const [reportData, setReportData] = useState<any[]>([])
    const [applicationTotalCounts, setApplicationTotalCounts] = useState({
        submitted: 0,
        postponed: 0,
        confirmed: 0,
        issued: 0,
        prepared: 0,
    })

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
        supervisorId: supervisor ?? undefined
    }
    const [filter, setFilter] = useState<ReportFilters>(initialFilters);

    const {
        appendData,
        refetch,
        isLoading,
    } = useQueryApiClient({
        request: {
            url: '/reports/applicationsBySocialStatus',
            data: filter,
        },
        onSuccess: (response: SocialStatusReport[]) => {
            const data: any[] = []
            const applicationTotalCounts = {
                submitted: 0,
                postponed: 0,
                confirmed: 0,
                issued: 0,
                prepared: 0,
            }
            response.map(item => {
                if (data?.some(i => i.educationalInstitutionId === item.educationalInstitution.id)) {
                    const index = data?.findIndex(i => i.educationalInstitutionId === item.educationalInstitution.id)
                    const existingItem = data[index]
                    data[index].applicationCounts[item.applicationStatus.code] += item.applicationCount
                    
                    if (data[index].socialStatuses.some((s: any) => s.code === item.socialStatus.code)) {
                        const socialStatusIndex = data[index].socialStatuses.findIndex((s: any) => s.code === item.socialStatus.code)
                        data[index].socialStatuses[socialStatusIndex][item.applicationStatus.code] += item.applicationCount
                    } else {
                        data[index].socialStatuses.push({
                            ...item.socialStatus,
                            submitted: 0,
                            postponed: 0,
                            confirmed: 0,
                            issued: 0,
                            prepared: 0,
                            [item.applicationStatus.code]: item.applicationCount
                        })
                    }
                    
                } else {
                    data.push({
                        educationalInstitutionName: item.educationalInstitution.name,
                        educationalInstitutionId: item.educationalInstitution.id,
                        applicationCounts: {
                            submitted: 0,
                            postponed: 0,
                            confirmed: 0,
                            issued: 0,
                            prepared: 0,
                            [item.applicationStatus.code]: item.applicationCount
                        },
                        socialStatuses: [{
                            ...item.socialStatus,
                            submitted: 0,
                            postponed: 0,
                            confirmed: 0,
                            issued: 0,
                            prepared: 0,
                            [item.applicationStatus.code]: item.applicationCount
                        }]
                    })
                }
                // @ts-ignore
                applicationTotalCounts[item.applicationStatus.code] += item.applicationCount
            })

            setReportData(data)
            setApplicationTotalCounts(applicationTotalCounts)
        }
    });
    return (
        <div className="flex flex-col gap-y-[10px]">
            <ReportsFilters 
                activeFilters={filter}
                filterState={setFilter}
                refresh={(newFilters: ReportFilters) => {
                    appendData(newFilters)
                }}
                permissionType={permissionType}
                initialFilters={initialFilters}
            />
            <div className="bg-white rounded-lg p-6">
                <div className='overflow-auto'>
                    <Spin spinning={isLoading}>
                        <div className='flex justify-end mb-2'>
                            <Button type='primary' onClick={() => createReportApplicationsBySocialStatusExcelFile(reportData, applicationTotalCounts)}>Eksportēt sarakstu</Button>
                        </div>
                        <table className="w-full reports-table">
                            <colgroup>
                                <col className="w-[600px]" />
                                <col className="" />
                                <col className="" />
                                <col className="" />
                                <col className="" />
                                <col className="" />
                            </colgroup>
                            <tbody className="">
                                <tr className="bg-[#fafafa]">
                                    <th rowSpan={2} className="confluenceTh"><br/></th>
                                    <th colSpan={5} className="confluenceTh"><strong>Statuss</strong><strong><br/></strong></th>
                                </tr>
                                <tr className="bg-[#fafafa]">
                                    <th className="confluenceTh">Iesniegts</th>
                                    <th className="confluenceTh">Atlikta izskatīšana</th>
                                    <th className="confluenceTh">Apstiprināts</th>
                                    <th className="confluenceTh">Sagatavots izsniegšanai</th>
                                    <th className="confluenceTh">Izsniegts</th>
                                </tr>
                                <tr className='bg-[#fafafa]'>
                                    <th  className="confluenceTh text-end">KOPĀ</th>
                                    <th  className="confluenceTh"><strong>{applicationTotalCounts?.submitted}</strong></th>
                                    <th  className="confluenceTh"><strong>{applicationTotalCounts?.postponed}</strong></th>
                                    <th  className="confluenceTh"><strong>{applicationTotalCounts?.confirmed}</strong></th>
                                    <th  className="confluenceTh"><strong>{applicationTotalCounts?.prepared}</strong></th>
                                    <th  className="confluenceTh"><strong>{applicationTotalCounts?.issued}</strong></th>
                                </tr>
                                {reportData.map((data, index) => (
                                    <React.Fragment key={`${data.educationalInstitutionName}-${index}`}>
                                        <tr className="">
                                            <td colSpan={6} className="confluenceTd"><Link href={`/admin/resources?educationalInstitution=${data.educationalInstitutionId}`}>{data.educationalInstitutionName}</Link><strong><br/></strong></td>
                                        </tr>
                                        <tr className="">
                                            <td className="confluenceTd text-end"><strong>Kopā</strong></td>
                                            <td className="confluenceTd text-center">{data.applicationCounts.submitted}</td>
                                            <td className="confluenceTd text-center">{data.applicationCounts?.postponed}</td>
                                            <td className="confluenceTd text-center">{data.applicationCounts?.confirmed}</td>
                                            <td className="confluenceTd text-center">{data.applicationCounts?.prepared}</td>
                                            <td className="confluenceTd text-center">{data.applicationCounts?.issued}</td>
                                        </tr>
                                        {data.socialStatuses.map((status: any) => (
                                            <React.Fragment key={`${status.code}`}>
                                                <tr className="">
                                                    <td className="confluenceTd text-end"><u>{status.value}</u></td>
                                                    <td className="confluenceTd text-center">{status?.submitted ?? 0}</td>
                                                    <td className="confluenceTd text-center">{status?.postponed ?? 0}</td>
                                                    <td className="confluenceTd text-center">{status?.confirmed ?? 0}</td>
                                                    <td className="confluenceTd text-center">{status?.prepared ?? 0}</td>
                                                    <td className="confluenceTd text-center">{status?.issued ?? 0}</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                                {(!reportData.length && !isLoading) &&
                                    <tr><td colSpan={6}><Empty description={'Nav datu'} /></td></tr>
                                }
                            </tbody>
                        </table>
                    </Spin>
                </div>
            </div>
        </div>
    )
}

export default ApplicationsBySocialStatus