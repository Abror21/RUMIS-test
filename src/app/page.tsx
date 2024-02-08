import { Main } from '@/app/templates/Main';
import { Login } from '@/app/components/login';
import { Metadata } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation";

// Static metadata
export const metadata: Metadata = {
  title: 'RUMIS',
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect(session?.user?.profileToken ? "/admin" : "/profile");
  }

  return (
    <Main showCustomFooter={true}>
      <Login />
    </Main>
  );
}
