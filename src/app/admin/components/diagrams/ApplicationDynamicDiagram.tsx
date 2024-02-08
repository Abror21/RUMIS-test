'use client'

import { ApplicationDynamic } from "@/app/types/Applications"
import { dateApplicationDynamicFormat, dateFormat } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Spin, Tooltip, Typography } from "antd"
import dayjs from "dayjs"
import { useState } from "react"
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

const {Title} = Typography

const ApplicationDynamicDiagram = () => {
    const [data, setData] = useState<any[]>([])

    const {
      isLoading,
    } = useQueryApiClient({
      request: {
        url: '/applications/applicationDynamics',
      },
      onSuccess: (response: ApplicationDynamic[]) => {
        const groupedData = response.reduce((result, entry) => {
            const date = dayjs(entry.applicationStatusChangeDate).format(dateApplicationDynamicFormat);
            const status = entry.applicationStatus.value;
            const count = entry.applicationCount;
        
            // @ts-ignore
            if (!result[date]) {
              // @ts-ignore
              result[date] = { name: date };
            }
            
            // @ts-ignore
            result[date][status] = count;
            // @ts-ignore
            result[date]['statusCode'] = entry.applicationStatus.code;
        
            return result;
        }, {});
      
        const formattedArray = Object.values(groupedData);
        setData(formattedArray)
      }
    });

    return (
        <div className="h-[500px]">
          {!isLoading ?
            <>
              <Title level={4}>Pieteikumu dinamika</Title>
              <ResponsiveContainer width="100%" height={450}>
                  <BarChart width={150} height={40} data={data}>
                      <Bar dataKey="Atteikts" fill="#FF9333" stackId="a"/>
                      <Bar dataKey="Dzēsts" fill="#f3babc" stackId="a"/>
                      <Bar dataKey="Atlikta izskatišana" fill="#de425b" stackId="a"/>
                      <Bar dataKey="Apstiprināts" fill="#bad0af" stackId="a"/>
                      <Bar dataKey="Atsaukts" fill="#FAFF33" stackId="a"/>
                      <Bar dataKey="Iesniegts" fill="#488f31" stackId="a"/>
                      <Legend />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                  </BarChart>
              </ResponsiveContainer>
            </>
            : <Spin spinning={true}></Spin>
          }
        </div>
    )
}

export default ApplicationDynamicDiagram