import React, { ReactNode } from 'react';
import { authOptions } from '@/lib/auth'
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'

type TPermissionProps = {
    children: ReactNode;
    permission: string;
    redirectTo?: string;
}

export const checkPermission = async (permission: string, redirectTo: string = '/') => {
    const sessionData = await getServerSession(authOptions)
  
    if (!sessionData) return;
    
    const permissions = sessionData?.user?.permissions
    if (!permissions) return;
    if (!permissions.includes(permission)) {
      redirect(redirectTo)
    }
}

const Permission = async ({permission, redirectTo = '/', children}: TPermissionProps) => {
    await checkPermission(permission, redirectTo)
    return (
        <>{children}</>
    )
}

export default Permission