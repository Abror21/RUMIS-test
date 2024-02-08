import { Application } from "./Applications";
import { Person } from "./Persons";

export type PnAct =  {
    id: string;
    pnaNumber: string;
    assignedResourceReturnDate: string;
    title: string;
    pnaStatus: {
      id: string;
      code: string;
      value: string
    }
    application: Application
    resource: {
        id: string;
        resourceSubType: {
            id: string;
            code: string;
            value: string;
        }
        serialNumber: string;
        resourceNumber: string;
        inventoryNumber: string;
        resourceType?: {
          id: string;
            code: string;
            value: string;
        }
    }
    assignedResource: {
      id: string;
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
      serialNumber: string;
      resourceNumber: string;
      inventoryNumber: string;
      manufacturer: {
        code: string;
        id: string;
        value: string;
      }
      modelName: {
        code: string;
        id: string;
        value: string;
      }
      resourceName: string
      acquisitionsValue: number;
    }
    notes: string | null;
    internalNotes: string | null;
    attachment: {
      documentDate: string;
    } | null;
    attachments: {
      id: string;
      documentDate: string;
      documentTemplate: {
        code: string;
        fileName: string;
        title: string;
        id: number;
      } | null
      documentType: {
        code: string;
        value: string;
        id: string;
      } | null
      file: {
        bucketName: string | null;
        content: string | null;
        contentType: string | null;
        id: string;
        length: number;
        sourceType: string | null;
        name: string;
        extension: string;
      } | null
    }[]
    educationalInstitutionContactPersons: {
      email: string;
      id: string;
      jobPosition: {
        code: string;
        id: string;
        value: string;
      }
      name: string;
      phoneNumber?: string;
    }[]
    resourceDiffer: boolean
    returnResourceDate?: string | null;
    returnResourceState: {
      id: string;
      code: string;
      value: string;
    } | null;
    userSetPrepared: {
      id: string;
      person: {
        id: string,
        firstName: string,
        lastName: string,
        privatePersonalIdentifier: string
      }[]
    } | null;
  }