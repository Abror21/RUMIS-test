import type { Session, User } from 'next-auth';
import { PersonProfileType } from '@/app/admin/users/components/personProfileView';
import { ListPersonProfileType, UserType } from '@/app/admin/users/components/users';
import { Workbook } from "exceljs"
import { Application } from '../types/Applications';
import { dateApplicationFormat, dateFormat } from './AppConfig';
import dayjs, { type Dayjs } from 'dayjs';
import * as NProgress from "nprogress";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Resource } from '../types/Resource';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { PnAct } from '../types/PnAct';
import { EducationalInstitution } from '../types/EducationalInstitution';
import { SupervisorList } from '../types/Supervisor';
import { ParsedResourceManufactureYearReport, ParsedResourceReportFilters, ParsedResourceSocialSupportReport, ParsedResourceTargetGroupReport, ParsedResourceUsagePurposeReport } from '../types/Report';

export type TColumn = {
  key: string,
  title: string
}

export const handleScroll = (ref: HTMLDivElement | null) => {
  if (ref) {
    window.scrollTo({
      top: ref.offsetTop - 70,
      left: 0,
      behavior: 'smooth',
    });
  }
};

export const cookieList = (token: User) => {
  if (token?.cookies) {
    return `AuthType=${token.authType}; ` + token.cookies.reduce((accumulator, currentValue) => {
      if (!currentValue.includes('AuthType')) {
        const cookieItem: string[] = currentValue.split('; ')
        const cookieNameValue: string[] = cookieItem[0].split('=')
        return accumulator + '; ' + cookieNameValue[0] + '=' + decodeURIComponent(cookieNameValue[1])
      }

      return accumulator
    }, '')
  }

  return ''
}

export const profileName = (profile: PersonProfileType | ListPersonProfileType): string => {
  if (profile.type === 'Supervisor') {
    return profile.supervisor?.name ?? ''
  }

  if (profile.type === 'EducationalInstitution') {
    return profile.educationalInstitution?.name ?? ''
  }

  return 'Valsts'
}

export const getPersonType = (profile: PersonProfileType | ListPersonProfileType): string => {
  if (profile.type === 'Supervisor') {
    return 'Vadošā iestāde'
  }

  if (profile.type === 'EducationalInstitution') {
    return 'Izglītības iestāde'
  }

  return 'Valsts'
}

export const personStatus = (user: UserType): boolean => {
  if (user?.userProfiles) {
      return user.userProfiles.some(profile => { return profile.isLoggedIn === true })
  }

  return false
}

export const getApplicationListValue = (value: any, item: Application, key: string) => {
  let parsedValue = value;
  switch (key) {
    case 'applicationDate':
      parsedValue = value && dayjs(value).format(dateApplicationFormat);
      break;
    case 'educationalInstitution':
    case 'supervisor':
      parsedValue = value.name;
      break;
    case 'submitterType':
    case 'resourceTargetPersonType':
    case 'resourceSubType':
    case 'applicationStatus':
    case 'resourceType':
      parsedValue = value.value;
      break;
    case 'resourceTargetPerson':
    case 'submitterPerson':
      const { firstName, lastName } = value.person[0];
      parsedValue = `${firstName} ${lastName ?? ''}`;
      break;
    case 'submitterPersonPk':
      const {privatePersonalIdentifier} = item.submitterPerson.person[0]
      parsedValue = privatePersonalIdentifier
      break;
    case 'socialStatus':
      parsedValue = value ? 'Atbilst' : 'Neatbilst';
      break;
    case 'resourceTargetPersonWorkStatus':
      parsedValue = value || item.resourceTargetPersonEducationalStatus
        ? (value?.value ?? item.resourceTargetPersonEducationalStatus?.value)
        : null
      break;
    case 'contactPerson':
      parsedValue = value?.contacts.find((person: any) => person.contactType.code === 'phone_number')?.contactValue
      break;
    case 'contactPersonEmail':
      parsedValue = item?.contactPerson?.contacts.find((person: any) => person.contactType.code === 'email')?.contactValue
      break;
  }

  return parsedValue;
}

export const getResourceListValue = (value: any, item: Resource, key: string) => {
  let parsedValue = value;

  switch (key) {
    case 'manufacturer':
        parsedValue = value.code
        break;
    case 'manufacturerName':
        parsedValue = item.manufacturer?.value
        break;
    case 'resourceSubType':
    case 'resourceStatus':
    case 'resourceLocation':
    case 'resourceGroup':
    case 'acquisitionType':
    case 'usagePurposeType':
    case 'targetGroup':
    case 'resourceType':
        parsedValue = value?.value
        break;
    case 'manufactureYear':
        parsedValue = value ? value : null
        break;
    case 'educationalInstitution':
        parsedValue = value?.name
        break;
    case 'acquisitionsValue':
        parsedValue = value + ' eiro'
        break;
  }

  return parsedValue;
}

export const getPnaListValue = (value: any, item: PnAct, key: string) => {
  let parsedValue = value;

  switch (key) {
    case 'documentDate':
        parsedValue = item?.attachment?.documentDate ? dayjs(item?.attachment?.documentDate).format(dateFormat) : ''
        break;
    case 'pnaStatus':
        parsedValue = value?.value
        break;
    case 'resourceUser':
          const {
            firstName,
            lastName,
            privatePersonalIdentifier
          } = item.application.resourceTargetPerson.persons[0]
          parsedValue = `${firstName} ${lastName} (${privatePersonalIdentifier})`
          break;
    case 'resourceTargetPersonType':
        parsedValue = item?.application.resourceTargetPersonType.value
        break;
    case 'resource':
        parsedValue = value?.resourceSubType.value
        break;
    case 'serialNumber':
        parsedValue = item.resource.serialNumber
        break;
    case 'resourceNumber':
        parsedValue = item.resource.resourceNumber
        break;
    case 'application':
        parsedValue = value?.applicationNumber
        break;
    case 'resourceTargetClassGroup':
        parsedValue = `${item.application.resourceTargetPersonClassGrade} ${item.application.resourceTargetPersonClassParallel}`
        break;
    case 'resourceTargetStatus':
        if (item?.application.resourceTargetPersonWorkStatus?.value || item?.application.resourceTargetPersonEducationalStatus?.value) {
          parsedValue = item?.application.resourceTargetPersonWorkStatus?.value ?? item?.application.resourceTargetPersonEducationalStatus?.value;
        }
        break;
    case 'inventoryNumber':
        parsedValue = item?.resource?.inventoryNumber
        break;
    case 'educationalInstitutionIds':
        parsedValue = item?.application.educationalInstitution?.name
        break;
    case 'supervisor':
        parsedValue = item?.application.supervisor?.name
        break;
    case 'assignedResourceReturnDate':
        parsedValue = value ? dayjs(value).format(dateFormat) : ''
        break;
    case 'resourceSubTypeIds':
        parsedValue = item?.resource?.resourceSubType?.value
        break;
    case 'resourceType':
        parsedValue = item?.resource.resourceType?.value
        break;
    case 'receivedDiffers':
        parsedValue = item.resourceDiffer ? 'Jā' : 'Nē'
        break;
    case 'resourceStatus':
        if (item?.application.resourceTargetPersonWorkStatus?.value || item?.application.resourceTargetPersonEducationalStatus?.value) {
            parsedValue =  item?.application.resourceTargetPersonWorkStatus?.value ?? item?.application.resourceTargetPersonEducationalStatus?.value
        }
        break;
  }

  return parsedValue;
}

export const getEduListValue = (value: any, item: EducationalInstitution, key: string) => {
  let parsedValue = value;

  switch (key) {
    case 'status':
        parsedValue = value?.value
        break;
    case 'supervisorName':
        parsedValue = item.supervisor?.name
        break;
  }

  return parsedValue;
}

export const getSupervisorListValue = (value: any, item: SupervisorList, key: string) => {
  let parsedValue = value;

  switch (key) {
    case 'status':
        parsedValue = value ? 'Aktīvs' : 'Neaktīvs'
        break;
    case 'educationalInstitutions':
        parsedValue = `${item?.activeEducationalInstitutions} no ${item?.educationalInstitutions}`
        break;
  }

  return parsedValue;
}

export const createApplicationListExcelFile = async (items: any[], columns: TColumn[]) => {
  const workbook = new Workbook()
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const sheet = workbook.addWorksheet()

  columns.forEach((col, i) => {
    sheet.getCell(`${alphabet[i]}1`).value = col.title
  })

  items.forEach((item, index) => {
    columns.forEach((col, i) => {
      const parsedValue = getApplicationListValue(item[col.key], item, col.key)
      sheet.getCell(`${alphabet[i]}${index + 2}`).value = parsedValue
    })
  })

  downloadCsvFile(workbook, 'Pieteikumi')
}

export async function getAllItemsFromListFetch(url: string, filters: any, sessionData: Session) {
  let page = 1;
  let allItems: any[] = [];

  while (true) {
    const queryParams = { ...filters, page };
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { 
        params: queryParams,
        paramsSerializer: {
          indexes: null, // no brackets at all
        },
        headers: {
          Authorization: `Bearer ${sessionData?.user?.accessToken}`,
          'Content-Type': 'application/json',
          'X-FRONTEND-ROUTE': window.location.pathname,
          'Profile': sessionData?.user?.profileToken
        },
        withCredentials: true
      });
      const data = response.data;

      if (data.items.length > 0) {
        // Add items to the array
        allItems = [
          ...allItems,
          ...data.items
        ]
        // Move to the next page
        page++;
      } else {
        // No more items, break out of the loop
        break;
      }
    } catch (error) {
      // Handle errors as needed
      console.error(error);
      break;
    }
  }

  return allItems;
}

export const getAllItemsFromList = async (url: string, filters: any, sessionData: Session, testFunction?: Function) => {
  try {
    const items = await getAllItemsFromListFetch(url, filters, sessionData);
    if(testFunction){
      testFunction()
    }
    return items;
  } catch (error) {
    console.error("Error fetching data:", error);
    return []
  }
}

export const createResourceListExcelFile = async (items: any[], columns: TColumn[]) => {
  const workbook = new Workbook()
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const sheet = workbook.addWorksheet()

  columns.forEach((col, i) => {
    sheet.getCell(`${alphabet[i]}1`).value = col.title
  })

  items.forEach((item, index) => {
    columns.forEach((col, i) => {
      const parsedValue = getResourceListValue(item[col.key], item, col.key)
      sheet.getCell(`${alphabet[i]}${index + 2}`).value = parsedValue
    })
  })

  downloadCsvFile(workbook, 'Resursi')
}

export const createPnaExcelFile = async (items: any[], columns: TColumn[]) => {
  const workbook = new Workbook()
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const sheet = workbook.addWorksheet()

  columns.forEach((col, i) => {
    sheet.getCell(`${alphabet[i]}1`).value = col.title
  })

  items.forEach((item, index) => {
    columns.forEach((col, i) => {
      const parsedValue = getPnaListValue(item[col.key], item, col.key)
      sheet.getCell(`${alphabet[i]}${index + 2}`).value = parsedValue
    })
  })

  downloadCsvFile(workbook, 'PN akti')
}

export const createEduListExcelFile = async (items: any[], columns: TColumn[]) => {
  const workbook = new Workbook()
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const sheet = workbook.addWorksheet()

  columns.forEach((col, i) => {
    sheet.getCell(`${alphabet[i]}1`).value = col.title
  })


  items.forEach((item, index) => {
    columns.forEach((col, i) => {
      const parsedValue = getEduListValue(item[col.key], item, col.key)
      sheet.getCell(`${alphabet[i]}${index + 2}`).value = parsedValue
    })
  })

  downloadCsvFile(workbook, 'Izglītības iestādes')
}

export const createSupervisorListExcelFile = async (items: any[], columns: TColumn[]) => {
  const workbook = new Workbook()
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const sheet = workbook.addWorksheet()

  columns.forEach((col, i) => {
    sheet.getCell(`${alphabet[i]}1`).value = col.title
  })

  items.forEach((item, index) => {
    columns.forEach((col, i) => {
      const parsedValue = getSupervisorListValue(item[col.key], item, col.key)
      sheet.getCell(`${alphabet[i]}${index + 2}`).value = parsedValue
    })
  })

  downloadCsvFile(workbook, 'Vadošas iestādes')
}

type ApplicationTotalCounts = {
  submitted: number,
  postponed: number,
  confirmed: number,
  prepared: number,
  issued: number,
}
export const createReportApplicationsByResourceTargetPersonTypeExcelFile = async (items: any[], applicationTotalCounts: ApplicationTotalCounts) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Iesniegts'
  sheet.getCell(`C1`).value = 'Atlikta izskatīšana'
  sheet.getCell(`D1`).value = 'Apstiprināts'
  sheet.getCell(`E1`).value = 'Sagatavots izsniegšanai'
  sheet.getCell(`F1`).value = 'Izsniegts'
  sheet.getCell(`A2`).value = 'Kopā'
  sheet.getCell(`B2`).value = applicationTotalCounts.submitted
  sheet.getCell(`C2`).value = applicationTotalCounts.postponed
  sheet.getCell(`D2`).value = applicationTotalCounts.confirmed
  sheet.getCell(`E2`).value = applicationTotalCounts.prepared
  sheet.getCell(`F2`).value = applicationTotalCounts.issued

  let index = 3
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      index++
      sheet.getCell(`A${index}`).value = 'Kopā'
      sheet.getCell(`B${index}`).value = item?.applicationCounts?.submitted
      sheet.getCell(`C${index}`).value = item?.applicationCounts?.postponed
      sheet.getCell(`D${index}`).value = item?.applicationCounts?.confirmed
      sheet.getCell(`E${index}`).value = item?.applicationCounts?.prepared
      sheet.getCell(`F${index}`).value = item?.applicationCounts?.issued
      index++
      sheet.getCell(`A${index}`).value = 'Izglītojamais'
      sheet.getCell(`B${index}`).value = item?.learner?.submitted ?? 0
      sheet.getCell(`C${index}`).value = item?.learner?.postponed ?? 0
      sheet.getCell(`D${index}`).value = item?.learner?.confirmed ?? 0
      sheet.getCell(`E${index}`).value = item?.learner?.prepared ?? 0
      sheet.getCell(`F${index}`).value = item?.learner?.issued ?? 0
      index++
      item?.learner?.subTypes.forEach((subType: any) => {
        sheet.getCell(`A${index}`).value = subType.value
        sheet.getCell(`B${index}`).value = subType.submitted
        sheet.getCell(`C${index}`).value = subType.postponed
        sheet.getCell(`D${index}`).value = subType.confirmed
        sheet.getCell(`E${index}`).value = subType.prepared
        sheet.getCell(`F${index}`).value = subType.issued
        index++
      })
      sheet.getCell(`A${index}`).value = 'Darbinieks'
      sheet.getCell(`B${index}`).value = item?.employee?.submitted ?? 0
      sheet.getCell(`C${index}`).value = item?.employee?.postponed ?? 0
      sheet.getCell(`D${index}`).value = item?.employee?.confirmed ?? 0
      sheet.getCell(`E${index}`).value = item?.employee?.prepared ?? 0
      sheet.getCell(`F${index}`).value = item?.employee?.issued ?? 0
      index++
      item?.employee?.subTypes.forEach((subType: any) => {
        sheet.getCell(`A${index}`).value = subType.value
        sheet.getCell(`B${index}`).value = subType.submitted
        sheet.getCell(`C${index}`).value = subType.postponed
        sheet.getCell(`D${index}`).value = subType.confirmed
        sheet.getCell(`E${index}`).value = subType.prepared
        sheet.getCell(`F${index}`).value = subType.issued
        index++
      })
  })

  downloadCsvFile(workbook, 'Resursa lietotāja veida variācija')
}

export const createReportApplicationsBySocialStatusExcelFile = async (items: any[], applicationTotalCounts: ApplicationTotalCounts) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Iesniegts'
  sheet.getCell(`C1`).value = 'Atlikta izskatīšana'
  sheet.getCell(`D1`).value = 'Apstiprināts'
  sheet.getCell(`E1`).value = 'Sagatavots izsniegšanai'
  sheet.getCell(`F1`).value = 'Izsniegts'
  sheet.getCell(`A2`).value = 'Kopā'
  sheet.getCell(`B2`).value = applicationTotalCounts.submitted
  sheet.getCell(`C2`).value = applicationTotalCounts.postponed
  sheet.getCell(`D2`).value = applicationTotalCounts.confirmed
  sheet.getCell(`E2`).value = applicationTotalCounts.prepared
  sheet.getCell(`F2`).value = applicationTotalCounts.issued

  let index = 3
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      index++
      sheet.getCell(`A${index}`).value = 'Kopā'
      sheet.getCell(`B${index}`).value = item?.applicationCounts?.submitted
      sheet.getCell(`C${index}`).value = item?.applicationCounts?.postponed
      sheet.getCell(`D${index}`).value = item?.applicationCounts?.confirmed
      sheet.getCell(`E${index}`).value = item?.applicationCounts?.prepared
      sheet.getCell(`F${index}`).value = item?.applicationCounts?.issued
      index++
      item?.socialStatuses.forEach((status: any) => {
        sheet.getCell(`A${index}`).value = status.value
        sheet.getCell(`B${index}`).value = status.submitted
        sheet.getCell(`C${index}`).value = status.postponed
        sheet.getCell(`D${index}`).value = status.confirmed
        sheet.getCell(`E${index}`).value = status.prepared
        sheet.getCell(`F${index}`).value = status.issued
        index++
      })
  })

  downloadCsvFile(workbook, 'Sociālā atbalstāmā grupa (Atbilst) variācija')
}

export const createReportApplicationsByClassGroupExcelFile = async (items: any[], applicationTotalCounts: ApplicationTotalCounts) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Iesniegts'
  sheet.getCell(`C1`).value = 'Atlikta izskatīšana'
  sheet.getCell(`D1`).value = 'Apstiprināts'
  sheet.getCell(`E1`).value = 'Sagatavots izsniegšanai'
  sheet.getCell(`F1`).value = 'Izsniegts'
  sheet.getCell(`A2`).value = 'Kopā'
  sheet.getCell(`B2`).value = applicationTotalCounts.submitted
  sheet.getCell(`C2`).value = applicationTotalCounts.postponed
  sheet.getCell(`D2`).value = applicationTotalCounts.confirmed
  sheet.getCell(`E2`).value = applicationTotalCounts.prepared
  sheet.getCell(`F2`).value = applicationTotalCounts.issued

  let index = 3
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      index++
      sheet.getCell(`A${index}`).value = 'Kopā'
      sheet.getCell(`B${index}`).value = item?.applicationCounts?.submitted
      sheet.getCell(`C${index}`).value = item?.applicationCounts?.postponed
      sheet.getCell(`D${index}`).value = item?.applicationCounts?.confirmed
      sheet.getCell(`E${index}`).value = item?.applicationCounts?.prepared
      sheet.getCell(`F${index}`).value = item?.applicationCounts?.issued
      index++
      item?.groups.forEach((group: any) => {
        sheet.getCell(`A${index}`).value = group.name
        sheet.getCell(`B${index}`).value = group.submitted
        sheet.getCell(`C${index}`).value = group.postponed
        sheet.getCell(`D${index}`).value = group.confirmed
        sheet.getCell(`E${index}`).value = group.prepared
        sheet.getCell(`F${index}`).value = group.issued
        index++
      })
  })

  downloadCsvFile(workbook, 'Klases/grupas variācija')
}

export const createReportResourcesByResourceSubTypeExcelFile = async (items: ParsedResourceReportFilters[]) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Jauns'
  sheet.getCell(`C1`).value = 'Pieejams izsniegšanai'
  sheet.getCell(`D1`).value = 'Rezervēts'
  sheet.getCell(`E1`).value = 'Lietošanā'
  sheet.getCell(`F1`).value = 'Apkopē'
  sheet.getCell(`G1`).value = 'Remontā'

  let index = 2
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      sheet.getCell(`G${index}`).value = " "
      index++
      item?.types.forEach((type: any) => {
        sheet.getCell(`A${index}`).value = type?.value
        index++
        sheet.getCell(`A${index}`).value = 'Kopā'
        sheet.getCell(`B${index}`).value = type?.new ?? 0
        sheet.getCell(`C${index}`).value = type?.available ?? 0
        sheet.getCell(`D${index}`).value = type?.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.under_repair ?? 0
        index++
        type?.subTypes.forEach((subType: any) => {
          sheet.getCell(`A${index}`).value = subType.value
          sheet.getCell(`B${index}`).value = subType?.new ?? 0
          sheet.getCell(`C${index}`).value = subType?.available ?? 0
          sheet.getCell(`D${index}`).value = subType?.reserved ?? 0
          sheet.getCell(`E${index}`).value = subType?.in_use ?? 0
          sheet.getCell(`F${index}`).value = subType?.maintenance ?? 0
          sheet.getCell(`G${index}`).value = subType?.under_repair ?? 0
          index++
        })
      })
  })

  downloadCsvFile(workbook, 'Resursu paveidi')
}

export const createReportResourcesBySocialSupportResourceExcelFile = async (items: ParsedResourceSocialSupportReport[]) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Jauns'
  sheet.getCell(`C1`).value = 'Pieejams izsniegšanai'
  sheet.getCell(`D1`).value = 'Rezervēts'
  sheet.getCell(`E1`).value = 'Lietošanā'
  sheet.getCell(`F1`).value = 'Apkopē'
  sheet.getCell(`G1`).value = 'Remontā'

  let index = 2
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      sheet.getCell(`G${index}`).value = " "
      index++
      item?.types.forEach((type: any) => {
        sheet.getCell(`A${index}`).value = type?.value
        index++
        sheet.getCell(`A${index}`).value = 'Kopā'
        sheet.getCell(`B${index}`).value = type?.new ?? 0
        sheet.getCell(`C${index}`).value = type?.available ?? 0
        sheet.getCell(`D${index}`).value = type?.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.under_repair ?? 0

        index++

        sheet.getCell(`A${index}`).value = 'Sociālā atbalsta resurss'
        sheet.getCell(`B${index}`).value = type?.socialSupport.new ?? 0
        sheet.getCell(`C${index}`).value = type?.socialSupport.available ?? 0
        sheet.getCell(`D${index}`).value = type?.socialSupport.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.socialSupport.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.socialSupport.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.socialSupport.under_repair ?? 0
        index++
      })
  })

  downloadCsvFile(workbook, 'Sociālie')
}

export const createReportByUsagePurposeTypeExcelFile = async (items: ParsedResourceUsagePurposeReport[]) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Jauns'
  sheet.getCell(`C1`).value = 'Pieejams izsniegšanai'
  sheet.getCell(`D1`).value = 'Rezervēts'
  sheet.getCell(`E1`).value = 'Lietošanā'
  sheet.getCell(`F1`).value = 'Apkopē'
  sheet.getCell(`G1`).value = 'Remontā'

  let index = 2
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      sheet.getCell(`G${index}`).value = " "
      index++
      item?.types.forEach((type: any) => {
        sheet.getCell(`A${index}`).value = type?.value
        index++
        sheet.getCell(`A${index}`).value = 'Kopā'
        sheet.getCell(`B${index}`).value = type?.new ?? 0
        sheet.getCell(`C${index}`).value = type?.available ?? 0
        sheet.getCell(`D${index}`).value = type?.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.under_repair ?? 0

        index++

        sheet.getCell(`A${index}`).value = 'Izsniegšanai individuāli'
        sheet.getCell(`B${index}`).value = type?.issuedIndividually.new ?? 0
        sheet.getCell(`C${index}`).value = type?.issuedIndividually.available ?? 0
        sheet.getCell(`D${index}`).value = type?.issuedIndividually.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.issuedIndividually.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.issuedIndividually.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.issuedIndividually.under_repair ?? 0

        index++

        sheet.getCell(`A${index}`).value = 'Mācību procesam iestādē'
        sheet.getCell(`B${index}`).value = type?.institutionLearningProcess.new ?? 0
        sheet.getCell(`C${index}`).value = type?.institutionLearningProcess.available ?? 0
        sheet.getCell(`D${index}`).value = type?.institutionLearningProcess.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.institutionLearningProcess.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.institutionLearningProcess.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.institutionLearningProcess.under_repair ?? 0
        index++
      })
  })

  downloadCsvFile(workbook, 'Izmantošanas mērķi')
}

export const createReportByTargetGroupExcelFile = async (items: ParsedResourceTargetGroupReport[]) => {
  const workbook = new Workbook()

  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Jauns'
  sheet.getCell(`C1`).value = 'Pieejams izsniegšanai'
  sheet.getCell(`D1`).value = 'Rezervēts'
  sheet.getCell(`E1`).value = 'Lietošanā'
  sheet.getCell(`F1`).value = 'Apkopē'
  sheet.getCell(`G1`).value = 'Remontā'

  let index = 2
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      sheet.getCell(`G${index}`).value = " "
      index++
      item?.types.forEach((type: any) => {
        sheet.getCell(`A${index}`).value = type?.value
        index++
        sheet.getCell(`A${index}`).value = 'Kopā'
        sheet.getCell(`B${index}`).value = type?.new ?? 0
        sheet.getCell(`C${index}`).value = type?.available ?? 0
        sheet.getCell(`D${index}`).value = type?.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.under_repair ?? 0

        index++

        sheet.getCell(`A${index}`).value = 'Izglītojamiem'
        sheet.getCell(`B${index}`).value = type?.learner.new ?? 0
        sheet.getCell(`C${index}`).value = type?.learner.available ?? 0
        sheet.getCell(`D${index}`).value = type?.learner.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.learner.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.learner.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.learner.under_repair ?? 0

        index++

        sheet.getCell(`A${index}`).value = 'Darbiniekiem'
        sheet.getCell(`B${index}`).value = type?.employee.new ?? 0
        sheet.getCell(`C${index}`).value = type?.employee.available ?? 0
        sheet.getCell(`D${index}`).value = type?.employee.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.employee.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.employee.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.employee.under_repair ?? 0
        index++
      })
  })

  downloadCsvFile(workbook, 'Mērķu grupas')
}

export const createReportByManufactureYearResourceExcelFile = async (items: ParsedResourceManufactureYearReport[]) => {
  const workbook = new Workbook()
  const sheet = workbook.addWorksheet()

  sheet.getCell(`A1`).value = 'Statuss'
  sheet.getCell(`B1`).value = 'Jauns'
  sheet.getCell(`C1`).value = 'Pieejams izsniegšanai'
  sheet.getCell(`D1`).value = 'Rezervēts'
  sheet.getCell(`E1`).value = 'Lietošanā'
  sheet.getCell(`F1`).value = 'Apkopē'
  sheet.getCell(`G1`).value = 'Remontā'

  let index = 2
  items.forEach((item) => {
      sheet.getCell(`A${index}`).value = item?.educationalInstitutionName
      sheet.getCell(`B${index}`).value = " "
      sheet.getCell(`C${index}`).value = " "
      sheet.getCell(`D${index}`).value = " "
      sheet.getCell(`E${index}`).value = " "
      sheet.getCell(`F${index}`).value = " "
      sheet.getCell(`G${index}`).value = " "
      index++
      item?.types.forEach((type: any) => {
        sheet.getCell(`A${index}`).value = type?.value
        index++
        sheet.getCell(`A${index}`).value = 'Kopā'
        sheet.getCell(`B${index}`).value = type?.new ?? 0
        sheet.getCell(`C${index}`).value = type?.available ?? 0
        sheet.getCell(`D${index}`).value = type?.reserved ?? 0
        sheet.getCell(`E${index}`).value = type?.in_use ?? 0
        sheet.getCell(`F${index}`).value = type?.maintenance ?? 0
        sheet.getCell(`G${index}`).value = type?.under_repair ?? 0

        index++
        type.years.forEach((y: any) => {
          sheet.getCell(`A${index}`).value = y.year
          sheet.getCell(`B${index}`).value = y?.new ?? 0
          sheet.getCell(`C${index}`).value = y?.available ?? 0
          sheet.getCell(`D${index}`).value = y?.reserved ?? 0
          sheet.getCell(`E${index}`).value = y?.in_use ?? 0
          sheet.getCell(`F${index}`).value = y?.maintenance ?? 0
          sheet.getCell(`G${index}`).value = y?.under_repair ?? 0

          index++
        })
      })
  })

  downloadCsvFile(workbook, 'Ražošanas gadi')
}

export const downloadCsvFile = async (workbook: Workbook, fileName: string) => {
  workbook.csv.writeBuffer().then(function (data: any) {
    const blob = new Blob([data], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${fileName}.csv`
    link.click()
  })
}

export const convertDateStringToDayjs = (dateString: string): Dayjs => {
  const date = new Date(dateString);
  const offsetDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));

  return dayjs(offsetDate);
}

export const goToUrl = (url: string, router: AppRouterInstance) => {
  NProgress.start();
  router.push(url)
}

export const getArrayDifference = (arrayOne: any, arrayTwo: any) => {
  return arrayOne.filter(({ value: id1 }: any) => !arrayTwo.some(({ value: id2 }: any) => id2 === id1));
}

export const signOutHandler = async (token: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      {},
      {
        headers: {
          'Cookie': cookieList(token),
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.accessToken}`,
        },
        withCredentials: true
      },
    );

    const { redirectUrl } = response.data;
    return redirectUrl;
  } catch (error) {
    console.error('Logout failed:', error);
    return '/'
  }
}

export const addFilterValuesToLocalStorage = (filters: any, propertyName: string) => {
  deleteFilterValuesFromLocalStorage(propertyName)

  for (const [key, value] of Object.entries(filters)) {
      if (key === 'sort' || key === 'take' || key === 'page') continue
      if (value) {
          if (typeof value === 'string' || typeof value === 'number') {
              localStorage.setItem(`${propertyName}${key}`, String(value))
          } else if (Array.isArray(value)) {
              localStorage.setItem(`${propertyName}${key}`, JSON.stringify(value))
          }
      }
  }
}

export const deleteFilterValuesFromLocalStorage = (propertyName: string) => {
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith(propertyName)) {
      localStorage.removeItem(key);
    }
  }
}

export const isJson = (str: string) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
