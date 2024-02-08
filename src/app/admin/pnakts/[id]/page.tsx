import { AdminMain } from '@/app/templates/AdminMain';
import { Application } from '@/app/admin/application/components/application';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import PnActView from './components/PnActView';
import axios, { AxiosRequestConfig } from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {PnAct as PnActType} from "@/app/types/PnAct"
import { permissions } from '@/app/utils/AppConfig';

const title = 'Pieņemšanas-nodošanas akts Nr.';

export const generateMetadata = ({ params }: { params: { id: string } }) => {
  return {
    title: `P/N akts ${params.id}`,
  }
}

export const dynamic = 'force-dynamic'

const getData = async (id: string): Promise<PnActType | null>  => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/applicationResources/${id}`,
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

const ActPage = async ({ params }: { params: { id: string } }) => {
  const data: PnActType | null = await getData(params.id)

  if (!data) {
    redirect('/admin/pnakti')
  }

  return (
    <AdminMain
      pageTitle={`${title} ${data.pnaNumber}`}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/pnakti">P/N akti</Link> },
        { title: `${title} ${data.pnaNumber}` },
      ]}
    >
      <Permission permission={permissions.applicationResourceView} redirectTo='/'>
        <PnActView data={data}/>
      </Permission>
    </AdminMain>
  );
};

export default ActPage;
