'use client'

import { ResourceSummary } from "@/app/types/Resource"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Spin, Tooltip, Typography } from "antd"
import { useState } from "react"
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

const {Title} = Typography

const ResourceDiagram = () => {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    
    const {} = useQueryApiClient({
      request: {
        url: '/Resources/resourceTypeSummary',
      },
      onSuccess: (response: ResourceSummary[]) => {
        parseData(response)
      }
    })

    const parseData = (response: ResourceSummary[]) => {
      const parsedData: any[] = []

      response.forEach(resource => {
        const resourceName: string = resource.resourceType.value;

        //@ts-ignore
        if (!parsedData[resourceName]) {
          //@ts-ignore
          parsedData[resourceName] = {
            name: resourceName,
          };
        }
        
        const locationName = resource.resourceLocation.value;
        const total = resource.total;
        
        //@ts-ignore
        parsedData[resourceName][locationName] = total;
      })
      setData(Object.values(parsedData))
      setIsLoading(false)
    }
    return (
        <div className="h-[500px]">
          {!isLoading ?
                <>
            <Title level={4}>Resursu veidu kopsavilkums</Title>
            <ResponsiveContainer width="100%" height={450}>
                <BarChart width={150} height={40} data={data}>
                    <Bar dataKey="Bibliotēkā" fill="#de425b" stackId="a"/>
                    <Bar dataKey="Mācību klasē" fill="#f3babc" stackId="a"/>
                    <Bar dataKey="Pie lietotāja" fill="#f67c41" stackId="a"/>
                    <Bar dataKey="Noliktavā" fill="#bad0af" stackId="a"/>
                    <Bar dataKey="Remontā" fill="#488f31" stackId="a"/>
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

export default ResourceDiagram