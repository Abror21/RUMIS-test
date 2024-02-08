import { AdminMain } from '@/app/templates/AdminMain';
import { Application } from '@/app/admin/application/components/application';
import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { cookies } from 'next/headers';
import { Application as ApplicationType } from '@/app/types/Applications';
import { getServerSession } from 'next-auth';
import axios, { AxiosRequestConfig } from 'axios';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const title = 'Pieteikums';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

export const dynamic = 'force-dynamic'

const getData = async (id: string): Promise<ApplicationType | null>  => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/applications/${id}`,
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

const ViewApplicationPage = async ({ params }: { params: { applicationId: string } }) => {
  const data: ApplicationType | null = await getData(params.applicationId)

  if (!data) {
    redirect('/admin/applications')
  }
  return (
    <AdminMain
      pageTitle={`${title}, Nr ${data.applicationNumber}`}
      background="#f5f5f5"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/applications">Pieteikumi</Link> },
        { title: `${title}, Nr ${data.applicationNumber}` },
      ]}
    >
      <Permission permission="application.view" redirectTo='/'>
        <Application 
          applicationId={params.applicationId} 
          initialData={data}
          initialSocialStatus={data.socialStatusApproved}
        />
      </Permission>
    </AdminMain>
  );
};

export default ViewApplicationPage;
