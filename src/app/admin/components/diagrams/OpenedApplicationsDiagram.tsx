'use client'

import { ApplicationSummary } from "@/app/types/Applications";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { Spin, Typography } from "antd";
import { useState } from "react";
import { Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { APPLICANT_STATUS_POSTPONED, APPLICANT_STATUS_SUBMITTED, PNA_STATUS_PREPARED, PNA_STATUS_PREPARING } from "../../application/new/components/applicantConstants";

const {Title} = Typography

type DiagramData = {
    name: string;
    value: number;
    fill: string;
}

const OpenedApplicationsDiagram = () => {
    const [data, setData] = useState<DiagramData[]>([])

    const diagramColors = {
        [APPLICANT_STATUS_POSTPONED]: '#f3babc',
        [APPLICANT_STATUS_SUBMITTED]: '#de425b',
        [PNA_STATUS_PREPARING]: '#bad0af',
        [PNA_STATUS_PREPARED]: '#488f31',
    }
    const data1 = [
        { name: 'Iesniegts', value: 15, fill: '#de425b' },
        { name: 'Atlikta izskatīšana', value: 8, fill: '#f3babc' },
        { name: 'Sagatave', value: 3, fill: '#bad0af'},
        { name: 'Sagatavots izsniegšanai', value: 12, fill: '#488f31' },
    ];

    const {
        isLoading,
      } = useQueryApiClient({
        request: {
          url: '/applications/activeApplicationSummary',
        },
        onSuccess: (response: ApplicationSummary[]) => {
            setData(response.map(application => ({
                name: application.status.value,
                value: application.total,
                // @ts-ignore
                fill: diagramColors[application.status.id]
            })))
        }
      });
    return (
        <div className="h-[500px]">
            {!isLoading ?
                <>
                    <Title level={4}>Kopā atvērtie pieteikumi</Title>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart width={500} height={430}>
                            <Pie 
                                data={data} 
                                dataKey="value" 
                                cx="50%" 
                                cy="50%" 
                                fill="#8884d8" 
                                label
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </>
                : <Spin spinning={true}></Spin>
            }
        </div>
    )
}

export default OpenedApplicationsDiagram