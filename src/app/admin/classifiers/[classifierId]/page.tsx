import { Metadata } from 'next'
import Link from 'next/link';
import Permission from '@/app/components/Permission';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth';
import axios, { AxiosRequestConfig } from 'axios';
import { AdminMain } from '@/app/templates/AdminMain';
import { ClassifierTerms } from '../components/classifierTerms';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { permissions } from '@/app/utils/AppConfig';


const title = 'Klasifikators';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const getData = async (code: string) => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/Classifiers?code=${code}&includeDisabled=true`,
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

    return response.data.length > 0 ? response.data : null
  } catch (e: any) {
    console.log(e?.response?.data)
    return null
  }
}

const ClassifiersPage = async ({ params }: { params: { classifierId: string } }) => {
  const data = await getData(params.classifierId);

  if (!data) {
    redirect('/admin/classifiers')
  }

  const classifierName = data?.[0]?.value || ''

  return (
    <AdminMain
      pageTitle={'Klasifikatori - ' + classifierName}
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/classifiers">Klasifikatori</Link> },
        { title: 'Klasifikatori - ' + classifierName },
      ]}
    >
      <Permission permission={permissions.classifierView} redirectTo='/'>
        <ClassifierTerms classifierId={params.classifierId} classifierName={classifierName} />
      </Permission>
    </AdminMain>
  );
};

export default ClassifiersPage;

