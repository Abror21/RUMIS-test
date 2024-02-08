'use client'

import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { goToUrl } from "@/app/utils/utils";
import { useRouter } from "next/navigation";
import { EditAddResourceForm } from "../../../new/components/EditAddResourceForm";

type ResourceCopyComponentProps = {
    resourceId: string
}

const ResourceCopyComponent = ({resourceId}: ResourceCopyComponentProps) => {
    const router = useRouter()
    const { data: resource } = useQueryApiClient({
        request: {
          url: `/resources/${resourceId}`,
        },
        onError: () => {
            goToUrl('/admin/resources', router)
        }
        
    });

    if (!resource || resource.length === 0) return null

    return (
        <EditAddResourceForm isAddForm={true} initialData={resource}/>
    )
}

export default ResourceCopyComponent