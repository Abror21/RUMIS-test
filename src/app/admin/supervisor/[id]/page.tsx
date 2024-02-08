import { AdminMain } from '@/app/templates/AdminMain';
import { Application } from '@/app/admin/application/components/application';
import { Metadata } from 'next'
import Link from 'next/link';
// import PnActView from './components/PnActView';
import axios, { AxiosRequestConfig } from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {PnAct as PnActType} from "@/app/types/PnAct"
import Permission from '@/app/components/Permission';
import { permissions } from '@/app/utils/AppConfig';
import { EducationalInstitution } from '@/app/types/EducationalInstitution';
import SupervisorView from './components/SupervisorView';
import {SupervisorView as SupervisorViewType} from '@/app/types/Supervisor'

export const generateMetadata = async ({ params }: { params: { id: string } }) => {
//   const data = await getData(params.id)
  return {
    title: '',
  }
}

export const dynamic = 'force-dynamic'

const getData = async (id: string): Promise<SupervisorViewType | null>  => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/supervisors/${id}`,
      method: 'GET',
      baseURL: process.env.NEXT_API_URL,
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${sessionData?.user?.accessToken}`,
        'Content-Type': 'application/json',
        'Profile': sessionData?.user?.profileToken,
        'Cookie': `Rumis.Session=${rumisSessionCookie}`
      },
    };

    const response = await axios.request(requestConfig);

    return response.data;
  } catch (e: any) {
    return null
  }
}

const SupervisorPage = async ({ params }: { params: { id: string } }) => {
const data: SupervisorViewType | null = await getData(params.id)

  if (!data) {
    redirect('/admin/supervisors')
  }

  return (
    <AdminMain
      pageTitle="Vadošās iestādes profils"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/supervisors">Vadošas iestādes</Link> },
        { title: `${''} ${params.id}` },
      ]}
    >
        <Permission permission={permissions.supervisorView} redirectTo='/'>
            <SupervisorView data={{...data, id: params.id}} />
        </Permission>
    </AdminMain>
  );
};

export default SupervisorPage;
