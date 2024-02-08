export type Resource = {
    id: string,
    created?: string,
    manufacturer?: {
        id: string
        code: string
        value: string
    },
    inventoryNumber?: string
    serialNumber?: string
    modelName?: {
        id: string
        code: string
        value: string
    }
    educationalInstitution?: {
        id: number
        code: string
        name: string
    }
    resourceName?: string
    modelIdentifier?: string
    resourceNumber?: string
    acquisitionsValue?: number,
    acquisitionType?: {
        id: string
        code: string
        value: string
    }
    manufactureYear?: number
    notes?: string
    resourceGroup?: {
        id: string
        code: string
        value: string
    }
    resourceLocation?: {
        id: string
        code: string
        value: string
    }
    resourceStatus?: {
        id: string
        code: string
        value: string
    }
    resourceStatusHistory?: string
    resourceSubType?: {
        id: string
        code: string
        value: string
    }
    targetGroup?: {
        id: string
        code: string
        value: string
    }
    usagePurposeType?: {
        id: string
        code: string
        value: string
    }
    resourceParameters: {
        id: string;
        value: string;
        parameter: {
            id: string;
            code: string;
            value: string;
        }
    }[]
    socialSupportResource: boolean | null;
}

export type ResourceFilterType = {
    resourceNumber?: string;
    inventoryNumber?: string;
    serialNumber?: string;
    resourceName?: string;
    modelNameIds?: string[];
    manufacturer?: string;
    resourceStatusIds?: string[];
    resourceSubTypeIds?: string;
    resourceGroup?: string;
    resourceUsingPurpose?: string;
    targetGroupIds?: string[];
    usagePurposeTypeIds?: string[];
    resourceLocationIds?: string[];
    educationalInstitutionIds?: string;
    supervisorIds?: string[];
    modelIdentifier?: string;
    acquisitionTypeIds?: string;
    socialSupportResource?: boolean;
    sort?: string;
    sortDir?: number;
    page: number;
    take: number;
}

export type ResourceSummary = {
    resourceType: {
        id: string;
        code: string;
        value: string;
    };
    total: number;
    resourceLocation: {
        id: string;
        code: string;
        value: string;
    }
}