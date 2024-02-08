'use client'

import { Button, Checkbox, Form, Tabs, TabsProps, Typography } from "antd";
import BasicDataTab from "./BasicDataTab";
import UsersTab from "./UsersTab";
import {SupervisorView as SupervisorViewType} from '@/app/types/Supervisor'
import LinkButton from "@/app/components/LinkButton";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { goToUrl } from "@/app/utils/utils";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

const { Title } = Typography;

type SupervisorViewProps = {
    data: SupervisorViewType
}

const SupervisorView = ({data}: SupervisorViewProps) => {
    const [form] = Form.useForm();

    const router = useRouter()

    const {appendData} = useQueryApiClient({
        request: {
            url: `/supervisors/${data.id}`,
            method: 'PUT',
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
                goToUrl('/admin/supervisors', router)
            })
        }
    })

    const tabsData: TabsProps['items'] = [
        {
            key: '1',
            label: 'Pamatdati',
            children: <BasicDataTab data={data}/>
        },
        {
            key: '2',
            label: 'Lietotāji',
            children: <UsersTab users={data?.users.map((u, index) => ({...u, key: index}))} />
        },
    ]

    const initialValues = {
        isActive: data.supervisor.isActive
    }
    

    const onFinish = (values: any) => {
        appendData({
            code: data.supervisor.code,
            name: data.supervisor.name,
            isActive: values.isActive
        })
    }

    return (
        <div>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
                <div className="flex justify-between">
                    <Title level={4}>{`${data.supervisor.name} (reģ. Nr. ${data.supervisor.code})`}</Title>
                    <Form.Item name="isActive" valuePropName="checked">
                        <Checkbox>Aktīvs</Checkbox>
                    </Form.Item>
                </div>
                <Tabs defaultActiveKey="1" items={tabsData} />
                <div className="flex gap-2 mt-4">
                    <LinkButton href={'/admin/supervisors'}>Atcelt</LinkButton>
                    <Button htmlType="submit" type="primary">Saglabāt</Button>
                </div>
            </Form>
        </div>
    )
}

export default SupervisorView