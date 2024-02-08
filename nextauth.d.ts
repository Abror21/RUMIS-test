//@ts-ignore
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    userName?: string;
    roles?: string[];
    accessToken: string;
    permissions?: string[];
    permissionType: string;
    accessTokenExpires?: string;
    authType?: string;
    cookies?: string[];
    profileId?: string;
    profileToken?: string;
    profileTokenExpires?: string;
    educationalInstitutionId?: number;
    supervisor?: number;
    notifyBeforeTimeoutInMinutes?: number;
    sessionIdleTimeoutInMinutes?: number;
  }

  interface Session {
    user?: User;
  }
}
