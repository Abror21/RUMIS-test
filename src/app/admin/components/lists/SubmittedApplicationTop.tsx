'use client'

import { Application } from "@/app/types/Applications";
import { SubmittedApplication } from "@/app/types/Supervisor";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { List, Typography } from "antd"
import Link from "next/link";

const {Title} = Typography

type SubmittedApplicationTopProps = {
  permissionType: string;
}

const SubmittedApplicationTop = ({permissionType}: SubmittedApplicationTopProps) => {
    const {
        data,
        appendData: refetchWithUpdatedData,
        isLoading,
        refetch
    } = useQueryApiClient({
      request: {
        url: '/applications/submittedApplicationTop',
      },
    });

    return (
        <div>
            <Title level={4}>Top10 neapstrādātie Pieteikumi</Title>
            <List
                loading={isLoading}
                size="small"
                bordered
                dataSource={data}
                renderItem={(item: SubmittedApplication) => (
                  <List.Item>
                    {permissionType === 'Country' &&
                      <Link href={`/admin/supervisor/${item.institution.id}`}>{item.institution.name}
                      </Link>
                    }
                    {permissionType === 'Supervisor' &&
                      <Link href={`/admin/educational-institution/${item.institution.id}`}>{item.institution.name}
                      </Link>
                    }
                  </List.Item>
                )}
            />
        </div>
    )
}

export default SubmittedApplicationTop