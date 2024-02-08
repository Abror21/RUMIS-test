import Permission from "@/app/components/Permission";
import { AdminMain } from "@/app/templates/AdminMain";
import { permissions } from "@/app/utils/AppConfig";
import Link from "next/link";
import EducationalInstitutionEdit from "./components/EducationalInstitutionEdit";
import { Metadata } from "next";
import { EducationalInstitution } from "@/app/types/EducationalInstitution";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import axios, { AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

export const generateMetadata = ({ params }: { params: { id: string } }) => {
  return {
    title: `Izglītības iestāde`,
  }
}

export const dynamic = 'force-dynamic'

const getData = async (id: string): Promise<EducationalInstitution | null>  => {
  try {
    const rumisSessionCookie = cookies().get('Rumis.Session')?.value
    const sessionData = await getServerSession(authOptions)
    const requestConfig: AxiosRequestConfig = {
      url: `/educationalInstitutions/${id}`,
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

const EditInstitutionPage = async ({ params }: { params: { id: string } }) => {
  const data: EducationalInstitution | null = await getData(params.id)

  if (!data) {
    redirect('/admin/educational-institutions')
  }

  return (
    <AdminMain
      pageTitle={''}
      background="#f5f5f5"
      breadcrumb={[
        { title: <Link href="/admin">Sākums</Link> },
        { title: <Link href="/admin/educational-institutions">Izglītības iestādes</Link> },
        { title: data.name },
      ]}
    >
      <Permission permission={permissions.educationalInstitutionEdit} redirectTo='/'>
        <EducationalInstitutionEdit data={data}/>
      </Permission>
    </AdminMain>
  )
}

export default EditInstitutionPage;