export type ClassifierResponse = {
    id: string,
    type: string,
    code: string,
    value: string,
    payload: string | {
        resource_type: string
    },
    isDisabled: boolean,
    isRequired: boolean,
    sortOrder: number | null,
    activeFrom: string | null,
    activeTo: string | null,
    permissionType: string | null,
    supervisorId: string | number | null,
    educationalInstitutionId: string | number | null,
}
