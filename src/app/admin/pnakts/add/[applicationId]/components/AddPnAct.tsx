'use client'

import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { Application as ApplicationType } from '@/app/types/Applications';
import { useRouter } from "next/navigation";
import PnAct from "./PnAct";
import { useState } from "react";
import { Spin } from "antd";
import { goToUrl } from "@/app/utils/utils";

const AddPnAct = ({ applicationId }: { applicationId: string }) => {
    const [application, setApplication] = useState<ApplicationType | null>(null)
    const router = useRouter();
    
    const {
        isLoading,
        appendData: refetch
      } = useQueryApiClient({
        request: {
          url: `/applications/${applicationId}`,
        },
        onSuccess: (response: ApplicationType) => {
            setApplication(response)
        },
        onError: () => {
            goToUrl('/admin/applications', router)
        }
    });


    return (
        <div>
            <Spin spinning={isLoading}>
                {application &&
                    <PnAct data={application} applicationId={applicationId} isAddForm={true} pnact={null}/>
                }
            </Spin>
        </div>
    )
}

export default AddPnAct