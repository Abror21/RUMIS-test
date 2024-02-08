import { Main } from '@/app/templates/Main';
import { Profile } from '@/app/profile/components/profile';
import { Metadata } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation";

const title = 'Izvēlies profilu';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

const Account = async () => {
  const session = await getServerSession(authOptions)
  if (session === null) {
    redirect("/");
  }

  return (
    <Main showCustomFooter={true}>
      <Profile />
    </Main>
  );
};

export default Account;


