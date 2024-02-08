'use client';

import {
    Button,
    Dropdown,
    Empty,
    Form,
    Modal,
    Spin,
    Table,
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {useRef, useState} from 'react';

import {AppConfig, dateFormat, mmDdYyFormat, permissions} from '@/app/utils/AppConfig';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import {createReportApplicationsByResourceTargetPersonTypeExcelFile, goToUrl, handleScroll} from '@/app/utils/utils';
import {useSession} from 'next-auth/react';
import {router} from "next/client";
import {ButtonWithIcon} from "@/app/components/buttonWithIcon";
import * as NProgress from "nprogress";
import {ControlOutlined, DownOutlined} from "@ant-design/icons";
import {Report, ReportFilters} from '@/app/types/Report'
import Link from 'next/link';
import ReportsFilters from '../ApplicationReportsFilters';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const { Column, ColumnGroup } = Table;

const {confirm} = Modal;

const ApplicationsByResourceTargetPersonType = () => {
    const [reportData, setReportData] = useState<any[]>([])
    const [applicationTotalCounts, setApplicationTotalCounts] = useState({
        submitted: 0,
        postponed: 0,
        confirmed: 0,
        issued: 0,
        prepared: 0,
    })
    const pageTopRef = useRef(null);

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
            url: '/reports/applicationsByResourceTargetPersonType',
            data: filter,
        },
        onSuccess: (response: Report[]) => {
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
                    if (data[index][item.resourceTargetPersonType.code]) {
                        data[index][item.resourceTargetPersonType.code][item.applicationStatus.code] += item.applicationCount
                        // @ts-ignore
                        if (data[index][item.resourceTargetPersonType.code].subTypes.some(t => t.value === item.resourceSubType.value)) {
                            // @ts-ignore
                            const subTypeIndex = data[index][item.resourceTargetPersonType.code].subTypes.findIndex(t => t.value === item.resourceSubType.value)
                            data[index][item.resourceTargetPersonType.code].subTypes[subTypeIndex][item.applicationStatus.code] += item.applicationCount
                        } else {
                            data[index][item.resourceTargetPersonType.code].subTypes.push({
                                value: item.resourceSubType.value,
                                submitted: 0,
                                postponed: 0,
                                confirmed: 0,
                                issued: 0,
                                prepared: 0,
                                [item.applicationStatus.code]: item.applicationCount
                            })
                        }
                    } else {
                        data[index][item.resourceTargetPersonType.code] = {
                            submitted: 0,
                            postponed: 0,
                            confirmed: 0,
                            issued: 0,
                            prepared: 0,
                            [item.applicationStatus.code]: item.applicationCount,
                            subTypes: [
                                {
                                    value: item.resourceSubType.value,
                                    submitted: 0,
                                    postponed: 0,
                                    confirmed: 0,
                                    issued: 0,
                                    prepared: 0,
                                    [item.applicationStatus.code]: item.applicationCount
                                }
                            ]
                        }
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
                        [item.resourceTargetPersonType.code]: {
                            submitted: 0,
                            postponed: 0,
                            confirmed: 0,
                            issued: 0,
                            prepared: 0,
                            [item.applicationStatus.code]: item.applicationCount,
                            subTypes: [
                                {
                                    value: item.resourceSubType.value,
                                    submitted: 0,
                                    postponed: 0,
                                    confirmed: 0,
                                    issued: 0,
                                    prepared: 0,
                                    [item.applicationStatus.code]: item.applicationCount
                                }
                            ]
                        }
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
            <div ref={pageTopRef} className="bg-white rounded-lg p-6">
                <div className='overflow-auto'>
                    <Spin spinning={isLoading}>
                        <div className='flex justify-end mb-2'>
                            <Button type='primary' onClick={() => createReportApplicationsByResourceTargetPersonTypeExcelFile(reportData, applicationTotalCounts)}>Eksportēt sarakstu</Button>
                        </div>
                        <table className="w-full reports-table">
                            <colgroup>
                                <col className="" />
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
                                        <tr className="">
                                            <td className="confluenceTd text-end"><u>Izglītojamais</u></td>
                                            <td className="confluenceTd text-center">{data?.learner?.submitted ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.learner?.postponed ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.learner?.confirmed ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.learner?.prepared ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.learner?.issued ?? 0}</td>
                                        </tr>
                                        {data?.learner?.subTypes.map((subType: any, i: number ) => (
                                            <React.Fragment key={`${subType.value}-${i}`}>
                                                <tr>
                                                    <td className="confluenceTd text-end"><em>{subType.value}</em></td>
                                                    <td className="confluenceTd text-center">{subType.submitted}</td>
                                                    <td className="confluenceTd text-center">{subType.postponed}</td>
                                                    <td className="confluenceTd text-center">{subType.confirmed}</td>
                                                    <td className="confluenceTd text-center">{subType.prepared}</td>
                                                    <td className="confluenceTd text-center">{subType.issued}</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                        <tr className="">
                                            <td className="confluenceTd text-end"><u>Darbinieks</u></td>
                                            <td className="confluenceTd text-center">{data?.employee?.submitted ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.employee?.postponed ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.employee?.confirmed ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.employee?.prepared ?? 0}</td>
                                            <td className="confluenceTd text-center">{data?.employee?.issued ?? 0}</td>
                                        </tr>
                                        {data?.employee?.subTypes.map((subType: any, i: number ) => (
                                            <React.Fragment key={`${subType.value}-${i}`}>
                                                <tr>
                                                    <td className="confluenceTd text-end"><em>{subType.value}</em></td>
                                                    <td className="confluenceTd text-center">{subType.submitted}</td>
                                                    <td className="confluenceTd text-center">{subType.postponed}</td>
                                                    <td className="confluenceTd text-center">{subType.confirmed}</td>
                                                    <td className="confluenceTd text-center">{subType.prepared}</td>
                                                    <td className="confluenceTd text-center">{subType.issued}</td>
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
    );
}

export default ApplicationsByResourceTargetPersonType