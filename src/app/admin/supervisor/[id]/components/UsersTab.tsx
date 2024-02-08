import { Table } from "antd";
import Link from "next/link";
import { useState } from "react";
import {SupervisorView as SupervisorViewType} from '@/app/types/Supervisor'

type UsersTabProps = {
    users: SupervisorViewType['users'];
}

const UsersTab = ({users}: UsersTabProps) => {
    const columns = [
        {
            title: 'Lietotājs',
            dataIndex: 'firstName',
            key: 'firstName',
            render: (_: any, user: SupervisorViewType['users'][number]) => <span key={`${user.firstName}-${user.lastName}`}>{user.firstName} {user.lastName}</span>,
            sorter: (a: any, b: any) => a.firstName.localeCompare(b.firstName),
        },
        {
            title: 'Loma',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: SupervisorViewType['users'][number]['roles']) => {
                return roles.map(role => (
                    <div key={role}>
                      {role}
                    </div>
                ))
            },
            sorter: (a: any, b: any) => a.roles[0].localeCompare(b.roles[0])
        },
        {
            title: 'Statuss',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: SupervisorViewType['users'][number]['isActive']) => <>{isActive ? 'Aktīvs' : 'Neaktvs'}</>,
            sorter: (a: any, b: any) => a.isActive - b.isActive,
        },
    ]

    return (
        <div>
            <Table 
                columns={columns} 
                dataSource={users}
                pagination={false}
            />
        </div>
    )
}

export default UsersTab