import './styles/global.css';

import Provider from "@/app/context/client-provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { AntdStyleProvider } from '@/app/components/AntdStyleProvider'
import { TimerProvider } from './components/TimerContext';
import SesionNotificationModal from './components/SesionNotificationModal';
import NextProgressBar from './components/progressBar';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <NextProgressBar>
          <Provider
            session={session}
          >
            <StyledComponentsRegistry>
              <AntdStyleProvider>
                <TimerProvider>
                  <SesionNotificationModal />
                  {children}
                </TimerProvider>
              </AntdStyleProvider>
            </StyledComponentsRegistry>
          </Provider>
        </NextProgressBar>
      </body>
    </html>
  );
}
