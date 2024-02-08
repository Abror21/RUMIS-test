import * as funcs from "../utils";
import { User } from "next-auth";
import type { Session } from "next-auth";
import {
  ListPersonProfileType,
  UserType,
} from "@/app/admin/users/components/users";
import { Application } from "@/app/types/Applications";
import { Resource } from "@/app/types/Resource";
import { PersonProfileType } from "@/app/admin/users/components/personProfileView";
import { PnAct } from "@/app/types/PnAct";
import { EducationalInstitution } from "@/app/types/EducationalInstitution";
import { SupervisorList } from "@/app/types/Supervisor";
import axios from "axios";
import * as NProgress from 'nprogress'; // Import the NProgress library

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  downloadCsvFile: jest.fn(() => {}),
  deleteFilterValuesFromLocalStorage: jest.fn()
}));
jest.mock("exceljs", () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: () => {
      return {
        getCell: (p: any) => {
          return {};
        },
      };
    },
    csv: {
      writeBuffer: () => {
        return new Promise(() => {});
      },
    },
  })),
}));
jest.mock("axios");
Object.defineProperty(window, "location", {
  value: {
    pathname: "/some/path",
  },
});
jest.mock('nprogress', () => ({
  start: jest.fn()
}));

const mockLocalStorage = {
  setItem: () => {},
  removeItem: () => {},
  'testPropertyName1': 'value1',
  'testPropertyName2': 'value2',
  'otherKey': 'otherValue'
};
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
});

describe("Utils", () => {
  describe("cookieList", () => {
    it("should return an empty string if token is undefined", () => {
      const result = funcs.cookieList(undefined as unknown as User);
      expect(result).toBe("");
    });

    it("should return an empty string if token.cookies is undefined", () => {
      const result = funcs.cookieList(undefined as unknown as User);
      expect(result).toBe("");
    });

    it("should return a formatted cookie string if token.cookies is defined", () => {
      const token: User = {
        cookies: [
          "cookie1=value1",
          "cookie2=value2",
          "AuthType=exampleAuthType",
        ],
        accessToken: "testAccessToken",
        permissionType: "testPermissionType",
        id: "testId",
        authType: "exampleAuthType",
      };
      const result = funcs.cookieList(token);
      expect(result).toBe(
        "AuthType=exampleAuthType; ; cookie1=value1; cookie2=value2"
      );
    });
  });

  describe("handleScroll", () => {
    it("handleScroll scrolls to the correct position", () => {
      const ref = {
        offsetTop: 100,
      };
      window.scrollTo = jest.fn();
      funcs.handleScroll(ref as HTMLDivElement);
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 30,
        left: 0,
        behavior: "smooth",
      });
    });
  });

  describe("profileName", () => {
    it("should return testName", () => {
      const result = funcs.profileName({
        type: "Supervisor",
        supervisor: {
          name: "testName",
        },
      } as ListPersonProfileType);
      expect(result).toBe("testName");
      const result2 = funcs.profileName({
        type: "Supervisor",
        supervisor: {},
      } as ListPersonProfileType);
      expect(result2).toBe("");
    });

    it("should return educationalInstitutionName", () => {
      const result = funcs.profileName({
        type: "EducationalInstitution",
        educationalInstitution: { name: "educationalInstitutionName" },
      } as ListPersonProfileType);
      expect(result).toBe("educationalInstitutionName");
      const result2 = funcs.profileName({
        type: "EducationalInstitution",
        educationalInstitution: {},
      } as ListPersonProfileType);
      expect(result2).toBe("");
    });

    it("should return Valsts", () => {
      const profile = {
        type: "default",
      };
      const result = funcs.profileName(profile as ListPersonProfileType);
      expect(result).toBe("Valsts");
    });
  });

  describe("getPersonType", () => {
    it("should return correct value", () => {
      const result = funcs.getPersonType({ type: "" } as PersonProfileType);
      expect(result).toBe("Valsts");
      const result2 = funcs.getPersonType({
        type: "Supervisor",
      } as PersonProfileType);
      expect(result2).toBe("Vadošā iestāde");
      const result3 = funcs.getPersonType({
        type: "EducationalInstitution",
      } as PersonProfileType);
      expect(result3).toBe("Izglītības iestāde");
    });
  });

  describe("personStatus", () => {
    it("should return true if user is logged in", () => {
      const user = {
        userProfiles: [{ isLoggedIn: true }, { isLoggedIn: false }],
      };
      expect(funcs.personStatus(user as UserType)).toBe(true);
    });

    it("should return false if user is not logged in", () => {
      const user = {};
      expect(funcs.personStatus(user as UserType)).toBe(false);
    });
  });

  describe("getApplicationListValue", () => {
    it("should return value", () => {
      const result = funcs.getApplicationListValue(
        "value",
        {} as Application,
        "key"
      );
      expect(result).toBe("value");
    });

    it("should return date", () => {
      const result = funcs.getApplicationListValue(
        "Wed Jan 03 2024 14:49:07",
        {} as Application,
        "applicationDate"
      );
      expect(result).toBe("03.01.2024 14:49");
    });

    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { name: "test" },
        {} as Application,
        "educationalInstitution"
      );
      expect(result).toBe("test");
    });

    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { name: "test" },
        {} as Application,
        "supervisor"
      );
      expect(result).toBe("test");
    });

    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { value: "test" },
        {} as Application,
        "submitterType"
      );
      expect(result).toBe("test");
    });
    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { value: "test" },
        {} as Application,
        "resourceTargetPersonType"
      );
      expect(result).toBe("test");
    });

    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { value: "test" },
        {} as Application,
        "resourceSubType"
      );
      expect(result).toBe("test");
    });

    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { value: "test" },
        {} as Application,
        "applicationStatus"
      );
      expect(result).toBe("test");
    });
    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        { value: "test" },
        {} as Application,
        "resourceType"
      );
      expect(result).toBe("test");
    });

    it("should return name, surname, idintifier", () => {
      const result = funcs.getApplicationListValue(
        {
          person: [
            {
              firstName: "name",
              lastName: "surname",
              privatePersonalIdentifier: "itentifier",
            },
          ],
        },
        {} as Application,
        "resourceTargetPerson"
      );
      expect(result).toBe("name surname");
    });

    it("should return name, surname, idintifier", () => {
      const result = funcs.getApplicationListValue(
        {
          person: [
            {
              firstName: "name",
              lastName: "surname",
              privatePersonalIdentifier: "itentifier",
            },
          ],
        },
        {} as Application,
        "submitterPerson"
      );
      expect(result).toBe("name surname");
    });
    it("should return test", () => {
      const result = funcs.getApplicationListValue(
        {},
        {
          submitterPerson: { person: [{ privatePersonalIdentifier: "test" }] },
        } as Application,
        "submitterPersonPk"
      );
      expect(result).toBe("test");
    });
    it("should return value", () => {
      const result = funcs.getApplicationListValue(
        { value: "value" },
        {} as Application,
        "resourceTargetPersonWorkStatus"
      );
      expect(result).toBe("value");
    });
    it("should return value", () => {
      const result = funcs.getApplicationListValue(
        {
          contacts: [
            { contactValue: "value", contactType: { code: "phone_number" } },
          ],
        },
        {} as Application,
        "contactPerson"
      );
      expect(result).toBe("value");
    });
    it("should return value", () => {
      const result = funcs.getApplicationListValue(
        {},
        {
          contactPerson: {
            contacts: [
              { contactValue: "value", contactType: { code: "email" } },
            ],
          },
        } as Application,
        "contactPersonEmail"
      );
      expect(result).toBe("value");
    });
    it("should return Atbilst", () => {
      const result = funcs.getApplicationListValue(
        {},
        {} as Application,
        "socialStatus"
      );
      expect(result).toBe("Atbilst");
    });

    it("should return Neatbilst", () => {
      const result = funcs.getApplicationListValue(
        null,
        {} as Application,
        "socialStatus"
      );
      expect(result).toBe("Neatbilst");
    });
  });

  describe("getResourceListValue", () => {
    it("should return value", () => {
      const result = funcs.getResourceListValue("value", {} as Resource, "key");
      expect(result).toBe("value");
    });

    it("should return code", () => {
      const result = funcs.getResourceListValue(
        { code: "12345" },
        {} as Resource,
        "manufacturer"
      );
      expect(result).toBe("12345");
    });

    it("should return manafacturer", () => {
      const result = funcs.getResourceListValue(
        "value",
        { manufacturer: { value: "manafacturer" } } as Resource,
        "manufacturerName"
      );
      expect(result).toBe("manafacturer");
    });

    it("should return test", () => {
      const result = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "resourceSubType"
      );
      expect(result).toBe("test");
      const result2 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "resourceStatus"
      );
      expect(result2).toBe("test");
      const result3 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "resourceLocation"
      );
      expect(result3).toBe("test");
      const result4 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "resourceGroup"
      );
      expect(result4).toBe("test");
      const result5 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "acquisitionType"
      );
      expect(result5).toBe("test");
      const result6 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "usagePurposeType"
      );
      expect(result6).toBe("test");
      const result7 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "targetGroup"
      );
      expect(result7).toBe("test");
      const result8 = funcs.getResourceListValue(
        { value: "test" },
        {} as Resource,
        "resourceType"
      );
      expect(result8).toBe("test");
    });

    it("should return manufactureYear", () => {
      const result = funcs.getResourceListValue(
        "value",
        {} as Resource,
        "manufactureYear"
      );
      expect(result).toBe("value");
      const result2 = funcs.getResourceListValue(
        "",
        {} as Resource,
        "manufactureYear"
      );
      expect(result2).toBe(null);
    });

    it("should return test", () => {
      const result = funcs.getResourceListValue(
        { name: "test" },
        {} as Resource,
        "educationalInstitution"
      );
      expect(result).toBe("test");
    });

    it("should return value eiro", () => {
      const result = funcs.getResourceListValue(
        "value",
        {} as Resource,
        "acquisitionsValue"
      );
      expect(result).toBe("value eiro");
    });
  });

  describe("getPnaListValue", () => {
    it("should return correct value", () => {
      const value = funcs.getPnaListValue(
        "value",
        { attachment: { documentDate: "Fri Jan 05 2024 19:04:00" } } as PnAct,
        "documentDate"
      );
      expect(value).toBe("05.01.2024");
      const value2 = funcs.getPnaListValue(
        { value: "test" },
        {} as PnAct,
        "pnaStatus"
      );
      expect(value2).toBe("test");
      const value3 = funcs.getPnaListValue(
        {},
        {
          application: {
            resourceTargetPerson: {
              persons: [
                {
                  firstName: "name",
                  lastName: "surname",
                  privatePersonalIdentifier: "id",
                },
              ],
            },
          },
        } as PnAct,
        "resourceUser"
      );
      expect(value3).toBe("name surname (id)");
      const value4 = funcs.getPnaListValue(
        {},
        {
          application: { resourceTargetPersonType: { value: "value" } },
        } as PnAct,
        "resourceTargetPersonType"
      );
      expect(value4).toBe("value");
      const value5 = funcs.getPnaListValue(
        { resourceSubType: { value: "value" } },
        {} as PnAct,
        "resource"
      );
      expect(value5).toBe("value");
      const value6 = funcs.getPnaListValue(
        {},
        { resource: { serialNumber: "test" } } as PnAct,
        "serialNumber"
      );
      expect(value6).toBe("test");
      const value7 = funcs.getPnaListValue(
        {},
        { resource: { resourceNumber: "test" } } as PnAct,
        "resourceNumber"
      );
      expect(value7).toBe("test");
      const value8 = funcs.getPnaListValue(
        { applicationNumber: "test" },
        {} as PnAct,
        "application"
      );
      expect(value8).toBe("test");
      const value9 = funcs.getPnaListValue(
        { applicationNumber: "test" },
        {
          application: {
            resourceTargetPersonClassGrade: "item",
            resourceTargetPersonClassParallel: "item",
          },
        } as PnAct,
        "resourceTargetClassGroup"
      );
      expect(value9).toBe("item item");
      const value10 = funcs.getPnaListValue(
        {},
        {
          application: { resourceTargetPersonWorkStatus: { value: "value" } },
        } as PnAct,
        "resourceTargetStatus"
      );
      expect(value10).toBe("value");
      const value11 = funcs.getPnaListValue(
        {},
        { resource: { inventoryNumber: "test" } } as PnAct,
        "inventoryNumber"
      );
      expect(value11).toBe("test");
      const value12 = funcs.getPnaListValue(
        {},
        { application: { educationalInstitution: { name: "test" } } } as PnAct,
        "educationalInstitutionIds"
      );
      expect(value12).toBe("test");
      const value13 = funcs.getPnaListValue(
        {},
        { application: { supervisor: { name: "test" } } } as PnAct,
        "supervisor"
      );
      expect(value13).toBe("test");
      const value14 = funcs.getPnaListValue(
        "",
        {} as PnAct,
        "assignedResourceReturnDate"
      );
      expect(value14).toBe("");
      const value15 = funcs.getPnaListValue(
        {},
        { resource: { resourceSubType: { value: "test" } } } as PnAct,
        "resourceSubTypeIds"
      );
      expect(value15).toBe("test");
      const value16 = funcs.getPnaListValue(
        {},
        { resource: { resourceType: { value: "test" } } } as PnAct,
        "resourceType"
      );
      expect(value16).toBe("test");
      const value17 = funcs.getPnaListValue({}, {} as PnAct, "receivedDiffers");
      expect(value17).toBe("Nē");
      const value18 = funcs.getPnaListValue(
        {},
        {
          application: { resourceTargetPersonWorkStatus: { value: "test" } },
        } as PnAct,
        "resourceStatus"
      );
      expect(value18).toBe("test");
    });
  });

  describe("getEduListValue", () => {
    it("should return correct value", () => {
      const value = funcs.getEduListValue(
        "value",
        {} as EducationalInstitution,
        "key"
      );
      expect(value).toBe("value");
      const value2 = funcs.getEduListValue(
        { value: "value" },
        {} as EducationalInstitution,
        "status"
      );
      expect(value2).toBe("value");
      const value3 = funcs.getEduListValue(
        { name: "value" },
        {} as EducationalInstitution,
        "supervisor"
      );
      expect(value3).toStrictEqual({"name": "value"}); 
    });
  });

  describe("getSupervisorListValue", () => {
    it("should return correct value", () => {
      const value = funcs.getSupervisorListValue(
        "value",
        {} as SupervisorList,
        "key"
      );
      expect(value).toBe("value");
      const value2 = funcs.getSupervisorListValue(
        "value",
        {} as SupervisorList,
        "status"
      );
      expect(value2).toBe("Aktīvs");
      const value3 = funcs.getSupervisorListValue(
        "",
        {} as SupervisorList,
        "status"
      );
      expect(value3).toBe("Neaktīvs");
      const value4 = funcs.getSupervisorListValue(
        "",
        {
          activeEducationalInstitutions: 10,
          educationalInstitutions: 11,
        } as SupervisorList,
        "educationalInstitutions"
      );
      expect(value4).toBe("10 no 11");
    });
  });

  describe("getAllItemsFromListFetch", () => {
    it("should fetch items", async () => {
      const url = "/items";
      const filters = {};
      const sessionData = {
        user: {
          accessToken: "test-access-token",
          profileToken: "test-profile-token",
        },
      };
      const response1 = { data: { items: ["item1", "item2"] } };
      const response2 = { data: { items: [] } };
      (axios.get as jest.Mock)
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2);
      const result = await funcs.getAllItemsFromListFetch(
        url,
        filters,
        sessionData as Session
      );
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenCalled()
    });

    it("should catch error", async () => {
      const url = "https://example.com/items";
      const filters = {};
      const sessionData = {
        user: {
          accessToken: "test-access-token",
          profileToken: "test-profile-token",
        },
      };
      const axiosError = new Error("Network Error");
      (axios.get as jest.Mock).mockRejectedValueOnce(axiosError);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await funcs.getAllItemsFromListFetch(
        url,
        filters,
        sessionData as Session
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(axiosError);
      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getAllItemsFromList", () => {
    it("should check type", async () => {
      const url = "/items";
      const filters = {};
      const sessionData = {
        user: {
          accessToken: "test-access-token",
          profileToken: "test-profile-token",
        },
      };
      const axiosError = new Error("Network Error");
      (axios.get as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(console, "error").mockImplementation();
      const items = funcs.getAllItemsFromList(
        url,
        filters,
        sessionData as Session,
      );
      expect(typeof items).toBe("object");
    });
    it("should check type", async () => {
      const url = "/items";
      const filters = {};
      const sessionData = {
        user: {
          accessToken: "test-access-token",
          profileToken: "test-profile-token",
        },
      };
      const axiosError = new Error("Network Error");
      (axios.get as jest.Mock).mockRejectedValueOnce(axiosError);
      jest.spyOn(console, "error").mockImplementation();
      const items = await funcs.getAllItemsFromList(url, filters, sessionData as Session, () => {throw new Error('test')});
      expect(items).toStrictEqual([]);
    });
  });

  describe("same mutiple functions", () => {
    const items = [{ id: "1" }];
    const columns = [
      { key: "id", title: "Id" },
      { key: "name", title: "Name" },
    ];
    it("should create Excel file and download it", async () => {
      funcs.createApplicationListExcelFile(items, columns);
      funcs.createResourceListExcelFile(items, columns);
      funcs.createPnaExcelFile(items, columns);
      funcs.createEduListExcelFile(items, columns);
      funcs.createSupervisorListExcelFile(items, columns);

      funcs.downloadCsvFile({}, "test");
      expect(funcs.downloadCsvFile).toHaveBeenCalled();
    });
  });

  describe('downloadCsvFile', () => {
    const mockWorkbook = {
      csv: {
        writeBuffer: () => {}
      }
    };
    const downloadCsvFileSpy = jest.spyOn(mockWorkbook.csv, 'writeBuffer')
    it('should download a CSV file', async () => {
      await funcs.downloadCsvFile(mockWorkbook, 'test-file');
      mockWorkbook.csv.writeBuffer()
      expect(downloadCsvFileSpy).toHaveBeenCalled();
    });
  });

  describe('convertDateStringToDayjs', () => {
    it('should return object type',  () => {
      const result = funcs.convertDateStringToDayjs('Mon Jan 08 2024 18:34:49');
      expect(typeof result).toBe("object")
    });
  });

  describe('goToUrl', () => {
    const mockRouter:any = {
      push: jest.fn()
    };
    it('should call router',  () => {
      const url = '/example-url';
      funcs.goToUrl(url, mockRouter);
      expect(NProgress.start).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith(url);
    });
  });

  describe('getArrayDifference', () => {
    it('should empty array',  () => {
      const result = funcs.getArrayDifference([{value: 'test'}], [{value: 'test'}]);
      expect(result).toStrictEqual([]);
    });
    it('should return difference',  () => {
      const result = funcs.getArrayDifference([{value: 'test'}, {value: 'test2'}], [{value: 'test'}]);
      expect(result).toStrictEqual([{value: 'test2'}]);
    });
  });

  describe('signOutHandler', () => {
    it('should return url',  async () => {
      const mockToken = { accessToken: 'mock-access-token' };
      const mockResponse = {
        data: {
          redirectUrl: '/redirect-url'
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      const redirectUrl = await funcs.signOutHandler(mockToken);
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: {
            'Cookie': expect.any(String),
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken.accessToken}`,
          },
          withCredentials: true
        }
      );
      expect(redirectUrl).toBe(mockResponse.data.redirectUrl);
    });
    it('should return /',  async () => {
      const redirectUrl2 = await funcs.signOutHandler(null);
      expect(redirectUrl2).toBe('/');
    });
  });

  describe('deleteFilterValuesFromLocalStorage', () => {
    it('should call localStroge', () => {
      const propertyName = 'testPropertyName';
      funcs.deleteFilterValuesFromLocalStorage(propertyName);
      expect(localStorage.hasOwnProperty(`${propertyName}1`)).toBe(true);
      expect(localStorage.hasOwnProperty(`${propertyName}2`)).toBe(true);
      expect(localStorage.hasOwnProperty('otherKey')).toBe(true);
    });
  });

  describe('addFilterValuesToLocalStorage', () => {
    it('should filter localStorage', () => {
      const filters = {
        filter1: 'value1',
        filter2: [1, 2, 3],
        sort: 'asc',
        take: 10,
        page: 1
      };
      const propertyName = 'testPropertyName';
      funcs.addFilterValuesToLocalStorage(filters, propertyName);
      expect(funcs.deleteFilterValuesFromLocalStorage).toHaveBeenCalledWith(propertyName);
      expect(localStorage[`${propertyName}1`]).toBe('value1');
      expect(localStorage[`${propertyName}2`]).toBe('value2');
      expect(localStorage[`${propertyName}sort`]).toBeUndefined();
      expect(localStorage[`${propertyName}take`]).toBeUndefined();
      expect(localStorage[`${propertyName}page`]).toBeUndefined();
    });
  });

  describe('isJson', () => {
    it('should return true', () => {
      const validJsonString = '{"key": "value"}';
      const result = funcs.isJson(validJsonString);
      expect(result).toBe(true);
    });
    it('should return false', () => {
      const invalidJsonString = 'not a JSON string';
      const result = funcs.isJson(invalidJsonString);
      expect(result).toBe(false);
    });
  });
});
