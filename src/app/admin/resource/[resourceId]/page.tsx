import Permission from '@/app/components/Permission';
import { AdminMain } from '@/app/templates/AdminMain';
import { permissions } from '@/app/utils/AppConfig';
import { Metadata } from 'next'
import Link from 'next/link';
import {Resource} from "@/app/admin/resource/[resourceId]/components/resource";
import axios, { AxiosRequestConfig } from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Resource as ResourceType} from '@/app/types/Resource';
import { redirect } from 'next/navigation';

const title = 'Resurss';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

export const dynamic = 'force-dynamic'

const getData = async (resourceId: string): Promise<ResourceType | null>  => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/resources/${resourceId}`,
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
    console.log(e?.response?.data)
    return null
  }
}

const ResourcePage = async  ({ params }: { params: { resourceId: string } }) => {
  const data: ResourceType | null = await getData(params.resourceId)

  if (!data) {
    redirect('/admin/resources')
  }

  const pageTitle = `${data?.manufacturer?.value} ${data?.modelName?.value}(${data?.resourceNumber})`;

  return (
    <AdminMain
      pageTitle={pageTitle}
      background="transparent"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/resources">Resursi</Link> },
        { title: pageTitle },
      ]}
    >
      <Permission permission={permissions.resourceView} redirectTo='/'>
        <Resource resourceId={params.resourceId} initialData={data}/>
      </Permission>
    </AdminMain>
  );
};

export default ResourcePage;

