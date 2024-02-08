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
import { EditAddResourceForm } from '../../new/components/EditAddResourceForm';

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

const ResourceEditPage = async  ({ params }: { params: { resourceId: string } }) => {
  const data: ResourceType | null = await getData(params.resourceId)

  if (!data) {
    redirect('/admin/resources')
  }

  return (
    <AdminMain
      pageTitle={title}
      background='#f5f5f5'
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/resources">Resursi</Link> },
        { title: title },
      ]}
    >
      <Permission permission={permissions.resourceEdit} redirectTo='/'>
        <EditAddResourceForm isAddForm={false} initialData={data}/>
      </Permission>
    </AdminMain>
  );
};

export default ResourceEditPage;