import type { NextAuthOptions } from 'next-auth/index';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookieList, signOutHandler } from '@/app/utils/utils';
import { AppConfig } from '@/app/utils/AppConfig';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function refreshAccessToken(oldToken: any) {
  try {
    const tokenResponse = await fetch(
      `${process.env.NEXT_API_URL}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Cookie': cookieList(oldToken),
          'Content-Type': 'application/json'
        },
      },
    );

    //@ts-ignore
    const cookiesList: string[] = tokenResponse.headers.getSetCookie()
    const user = await tokenResponse.json()

    if (!tokenResponse.ok) throw oldToken

    return {
      ...oldToken,
      id: user.id,
      accessToken: user.accessToken,
      userName: user.userName,
      roles: user.roles,
      permissions: user.permissions,
      accessTokenExpires: user.accessTokenExpires,
      cookies: cookiesList,
    };
  } catch (error) {
    return {
      ...oldToken,
      error: 'RefreshAccessTokenError',
    };
  }
}

async function refreshProfileToken(oldToken: any) {
  try {
    const {profileId, accessToken} = oldToken
    const tokenResponse = await fetch(
      `${process.env.NEXT_API_URL}/account/setprofile(${profileId})`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      },
    );

    const token = await tokenResponse.json()
    if (!tokenResponse.ok) throw oldToken

    return {
      ...oldToken,
      profileToken: token.token,
      profileTokenExpires: token.tokenExpires,
      permissions: token.permissions
    }
  } catch (error) {
    return {
      ...oldToken,
      error: 'RefreshProfileTokenError',
    };
  }
}

async function getConfiguration(token: any) {
  try {
    const configurationResponse = await fetch(
      `${process.env.NEXT_API_URL}/auth/configuration`,
      {
        method: 'GET',
        // headers: {
        //   'Cookie': cookieList(oldToken),
        //   'Content-Type': 'application/json'
        // },
      },
    );

    const configuration = await configurationResponse.json()

    if (!configuration) throw Error

    return {
      ...token,
      sessionIdleTimeoutInMinutes: configuration.sessionIdleTimeoutInMinutes,
      notifyBeforeTimeoutInMinutes: configuration.notifyBeforeTimeoutInMinutes,
    };
  } catch (error) {
    return token
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: AppConfig.tokenInterval * 60, // n minutes
  },
  providers: [
    CredentialsProvider({
      id: 'default',
      name: 'Sign in',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        const authResponse = await fetch(
          `${process.env.NEXT_API_URL}/auth/login`,
          {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (authResponse.status === 500) {
          return null;
        }

        //@ts-ignore
        const cookiesList: string[] = authResponse.headers.getSetCookie()

        const rumisSession = cookiesList[1]
        const cookieItem: string[] = rumisSession.split('; ')
        const cookieNameValue: string[] = cookieItem[0].split('=')

        cookies().set({
          name: cookieNameValue[0],
          value: decodeURIComponent(cookieNameValue[1])
        })
        cookies().set({
          name: 'AuthType',
          value: 'Forms'
        })

        const user = await authResponse.json();

        let token = { ...user, cookies: cookiesList, authType: 'Forms' }
        token = await getConfiguration(token)

        return token;
      },
    }),
    CredentialsProvider({
      id: 'adfs',
      name: 'ADFS',
      credentials: {
        code: { label: 'code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null;
        }

        const authResponse = await fetch(
          `${process.env.NEXT_API_URL}/auth/login`,
          {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (authResponse.status === 500) {
          return null;
        }

        //@ts-ignore
        const cookiesList: string[] = authResponse.headers.getSetCookie()

        const rumisSession = cookiesList[1]
        const cookieItem: string[] = rumisSession.split('; ')
        const cookieNameValue: string[] = cookieItem[0].split('=')
        
        cookies().set({
          name: 'AuthType',
          value: 'Adfs'
        })
        cookies().set({
          name: cookieNameValue[0],
          value: decodeURIComponent(cookieNameValue[1])
        })

        const user = await authResponse.json()

        let token = { ...user, cookies: cookiesList, authType: 'Adfs' }
        token = await getConfiguration(token)

        return token;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    signOut: async function ({ token }) {
      // signOutHandler(token)
      // const logoutToken = token as unknown as any
      // const tokenResponse = await fetch(
      //   `${process.env.NEXT_API_URL}/auth/logout`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Cookie': cookieList(logoutToken),
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${logoutToken.accessToken}`,
      //     },
      //   },
      // );

      // redirect('/')
    },
  },

  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          accessToken: token.accessToken,
          userName: token.userName,
          roles: token.roles,
          permissions: token.permissions,
          accessTokenExpires: token.accessTokenExpires,
          cookies: token.cookies,
          authType: token.authType,
          profileId: token?.profileId,
          profileToken: token?.profileToken,
          profileTokenExpires: token?.profileTokenExpires,
          educationalInstitutionId: token?.educationalInstitutionId,
          permissionType: token?.permissionType,
          supervisor: token?.supervisor,
          sessionIdleTimeoutInMinutes: token?.sessionIdleTimeoutInMinutes,
          notifyBeforeTimeoutInMinutes: token?.notifyBeforeTimeoutInMinutes,
        },
      };
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as any
        return {
          ...token,
          id: u.id,
          accessToken: u.accessToken,
          userName: u.userName,
          roles: u.roles,
          permissions: u.permissions,
          accessTokenExpires: u.accessTokenExpires,
          cookies: u.cookies,
          authType: u.authType,
          sessionIdleTimeoutInMinutes: u?.sessionIdleTimeoutInMinutes,
          notifyBeforeTimeoutInMinutes: u?.notifyBeforeTimeoutInMinutes,
        }
      }

      if (trigger === 'update') {
        token.profileToken = session.profileToken
        token.profileTokenExpires = session.profileTokenExpires
        token.profileId = session.profileId
        token.permissions = session.permissions
        token.educationalInstitutionId = session.educationalInstitutionId
        token.supervisor = session.supervisor
        token.permissionType = session.permissionType
      }

      return token
    },
    async redirect({ url }) {
      return url
    }
  },
};
