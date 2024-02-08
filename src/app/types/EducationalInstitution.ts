export type EducationalInstitution = {
    id: number,
    code: string,
    name: string,
    status: {
        id: string,
        code: string,
        value: string
    },
    supervisor: {
        id: number,
        code: string,
        name: string
    },
    educationalInstitutionContactPersons: {
        id: string | null
        email: string | null
        address: string | null
        phoneNumber: string | null
        name: string
        jobPosition: {
            id: string,
            code: string,
            value: string
        }
        contactPersonResourceSubTypes?: {
            id: string;
            resourceSubType: {
                id: string;
                code: string;
                value: string
            }
        }[]
    }[]
    educationalInstitutionResourceSubTypes: {
        id: string | null;
        resourceSubTypeId?: string;
        resourceSubType?: {
            id: string;
            value: string;
            code: string;
        };
        targetPersonGroupTypeId?: string | null;
        targetPersonGroupType?: {
            id: string;
            value: string;
            code: string;
        }
        isActive: boolean;
    }[]
    email: string | null
    address: string | null
    phoneNumber: string | null
    district: string | null
}

export type EducationalInstitutionFilter = {
    sort?: string;
    sortDir?: number;
    page: number;
    take: number;
    educationalInstitutionIds?: number[],
    educationalInstitution?: number,
    supervisorIds?: number[],
    status?: string
    educationalInstitutionStatusIds?: string
}