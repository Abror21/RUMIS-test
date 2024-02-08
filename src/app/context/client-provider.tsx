'use client'

import { SessionProvider } from "next-auth/react"
import { AppConfig } from "../utils/AppConfig"

export default function Provider({
  children,
  session
}: {
  children: React.ReactNode
  session: any
}): React.ReactNode {
  return (
    <SessionProvider
      session={session}
      // Re-fetch session every n minutes
      refetchInterval={(AppConfig.tokenInterval - 3) * 60}
    >
      {children}
    </SessionProvider>
  )
}
