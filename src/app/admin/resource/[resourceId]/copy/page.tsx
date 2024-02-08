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
import ResourceCopyComponent from './components/ResourceCopyComponent';

const title = 'Resurss';

// Static metadata
export const metadata: Metadata = {
  title: title,
}

export const dynamic = 'force-dynamic'

const ResourceCopyPage = async  ({ params }: { params: { resourceId: string } }) => {
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
        <ResourceCopyComponent resourceId={params.resourceId} />
      </Permission>
    </AdminMain>
  );
};

export default ResourceCopyPage;