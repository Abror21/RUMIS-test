import { Main } from '@/app/templates/Main';
import { Metadata } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation";
import { AdfsLogin } from '@/app/auth/login/components/adfsLogin';

// Static metadata
export const metadata: Metadata = {
  title: 'RUMIS',
}

type PageSearchParams = {
  code?: string;
  returnUrl?: string;
}

type Props = {
  params: {};
  searchParams: PageSearchParams;
};

export default async function AdfsPage(props: Props) {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/admin");
  }

  const code: string = props.searchParams.code!
  const returnUrl: string = props.searchParams.returnUrl!

  if (code === undefined && returnUrl === undefined) {
    redirect("/");
  }

  return (
    <Main>
      <AdfsLogin
        code={code}
        returnUrl={returnUrl}
      />
    </Main>
  );
}
