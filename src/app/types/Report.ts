export type Report = {
    educationalInstitution: {
        id: number;
        code: string;
        name: string;
    }
    applicationStatus: {
        id: number;
        code: string;
        value: string;
    }
    resourceTargetPersonType: {
        id: number;
        code: string;
        value: string;
    }
    resourceSubType: {
        id: number;
        code: string;
        value: string;
    }
    applicationCount: number
}

export type ReportFilters = {
    date: string;
    supervisorId?: number;
    educationalInstitutionId?: number;
}

export type SocialStatusReport = {
    applicationCount: number,
    applicationStatus: {
        id: number;
        code: string;
        value: string;
    }
    educationalInstitution: {
        id: number;
        code: string;
        name: string;
    }
    socialStatus: {
        id: string;
        code: string;
        value: string;
    }
}

export type ClassGroupReport = {
    applicationCount: number,
    applicationStatus: {
        id: number;
        code: string;
        value: string;
    }
    educationalInstitution: {
        id: number;
        code: string;
        name: string;
    }
    resourceTargetPersonClassGrade: number,
    resourceTargetPersonClassParallel: string,
    resourceTargetPersonGroup: any
}

export type ResourceReportFilters = {
    date: string;
    supervisorId?: number;
    educationalInstitutionId?: number;
    resourceTypeId?: string;
}

export type ParsedResourceReportFilters = {
    educationalInstitutionId: number;
    educationalInstitutionName: string;
    types: {
        available: number;
        new: number;
        in_use: number;
        maintenance: number;
        reserved: number;
        under_repair: number;
        code: string;
        id: string;
        value: string;
        subTypes: {
            value: string;
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }[]
    }[]
}

export type ResourceReport = {
    educationalInstitution: {
        code: string;
        id: number;
        name: string;
    }
    resourceCount: number
    resourceStatus: {
        id: string;
        code: string;
        value: string;
    }
    resourceSubType: {
        id: string;
        code: string;
        value: string;
    }
    resourceType: {
        id: string;
        code: string;
        value: string;
    }
}

export type ResourceSocialSupportReport = {
    educationalInstitution: {
        code: string;
        id: number;
        name: string;
    }
    resourceCount: number
    resourceStatus: {
        id: string;
        code: string;
        value: string;
    }
    resourceType: {
        id: string;
        code: string;
        value: string;
    }
    socialSupportResource:  boolean;
}

export type ParsedResourceSocialSupportReport = {
    educationalInstitutionId: number;
    educationalInstitutionName: string;
    types: {
        available: number;
        new: number;
        in_use: number;
        maintenance: number;
        reserved: number;
        under_repair: number;
        code: string;
        value: string;
        socialSupport: {
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }
    }[]
}

export type ResourceUsagePurposeReport = {
    educationalInstitution: {
        code: string;
        id: number;
        name: string;
    }
    resourceCount: number
    resourceStatus: {
        id: string;
        code: string;
        value: string;
    }
    resourceType: {
        id: string;
        code: string;
        value: string;
    }
    usagePurposeType: {
        code: string;
        id: string;
        value: string;
    }
}

export type ParsedResourceUsagePurposeReport = {
    educationalInstitutionId: number;
    educationalInstitutionName: string;
    types: {
        available: number;
        new: number;
        in_use: number;
        maintenance: number;
        reserved: number;
        under_repair: number;
        value: string;
        code: string;
        institutionLearningProcess: {
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }
        issuedIndividually: {
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }

    }[]
}

export type ResourceTargetGroupReport = {
    educationalInstitution: {
        code: string;
        id: number;
        name: string;
    }
    resourceCount: number
    resourceStatus: {
        id: string;
        code: string;
        value: string;
    }
    resourceType: {
        id: string;
        code: string;
        value: string;
    }
    targetGroup: {
        code: string;
        id: string;
        value: string;
    }
}

export type ParsedResourceTargetGroupReport = {
    educationalInstitutionId: number;
    educationalInstitutionName: string;
    types: {
        available: number;
        new: number;
        in_use: number;
        maintenance: number;
        reserved: number;
        under_repair: number;
        value: string;
        code: string;
        employee: {
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }
        learner: {
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }
    }[]
}

export type ResourceManufactureYearReport = {
    educationalInstitution: {
        code: string;
        id: number;
        name: string;
    }
    resourceCount: number
    resourceStatus: {
        id: string;
        code: string;
        value: string;
    }
    resourceType: {
        id: string;
        code: string;
        value: string;
    }
    manufactureYear: number
}

export type ParsedResourceManufactureYearReport = {
    educationalInstitutionId: number;
    educationalInstitutionName: string;
    types: {
        available: number;
        new: number;
        in_use: number;
        maintenance: number;
        reserved: number;
        under_repair: number;
        value: string;
        code: string;
        years: {
            year: number;
            available: number;
            new: number;
            in_use: number;
            maintenance: number;
            reserved: number;
            under_repair: number;
        }[]
    }[]
}