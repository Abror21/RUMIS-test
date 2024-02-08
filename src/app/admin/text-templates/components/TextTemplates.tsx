'use client'

import { permissions } from "@/app/utils/AppConfig";
import useQueryApiClient from "@/app/utils/useQueryApiClient";
import { Button, Form, Input, Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Ckeditor from "@/app/admin/document-templates/components/ckeditor"

interface DataType {
    id: string;
    code: string;
    content: string;
    title: string;
  }
  
const TextTemplates = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [active, setActive] = useState<DataType | null>(null);
    const [form] = Form.useForm();

    const { data: textTemplates, refetch, isLoading } = useQueryApiClient({
        request: {
            url: '/textTemplates',
        },
    });

    const { appendData, isLoading: postLoader } = useQueryApiClient({
        request: {
          url: `/textTemplates/:id`,
          method: 'PUT',
        },
        onSuccess: () => {
          setActive(null);
          setModalOpen(false);
          form.resetFields();
          refetch();
        },
    });

    const { data: sessionData } = useSession();
    const userPermissions: string[] = sessionData?.user?.permissions || []
    const editPermission: boolean = userPermissions.includes(permissions.textTemplateEdit)
    
    const handleCancel = () => {
        setModalOpen(false)
        form.resetFields()
        setActive(null)
    }
        
    const handleEdit = (data: DataType) => {
        setActive(data);
        form.setFieldsValue(data);
        setModalOpen(true);
    };
    
    const initialColumns = [
        {
            title: 'Kods',
            dataIndex: 'code',
            key: 'code',
            show: true
        },
        {
            title: 'Nosaukumus',
            dataIndex: 'title',
            key: 'title',
            show: true
        },
        {
            title: 'Vērtība',
            dataIndex: 'content',
            key: 'content',
            show: true
        },
        {
            title: 'Darbības',
            dataIndex: 'operation',
            key: 'operation',
            width: '150px',
            render: (_: any, record: DataType) => (
                <Button
                    onClick={() => handleEdit(record)}
                >
                    Labot
                </Button>
            ),
            show: editPermission
        },
    ];
    const columns: ColumnsType<DataType> =  initialColumns.filter(column => column.show)

    const handleParameter = async () => {
        if (active?.id) {
          appendData({
            code: active?.code,
            title: active?.title,
            content: active?.content
          }, { id: active.id });
        }
    };

    return (
        <div>
            <Table
                loading={isLoading}
                columns={columns}
                dataSource={textTemplates}
                pagination={false}
                rowKey={(record) => record.id}
            />
            {modalOpen &&
                <Modal
                    title={active && `Paziņojumu - ${active.code} rediģēšana`}
                    centered
                    open={true}
                    onCancel={handleCancel}
                    width={900}
                    footer={[
                    <Button key="back" onClick={handleCancel}>
                        Atcelt
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={postLoader}
                        onClick={handleParameter}
                    >
                        Saglabāt
                    </Button>,
                    ]}
                >
                    <Ckeditor
                        text={active?.content ?? ''}
                        // @ts-ignore
                        setText={(v: string) => setActive({...active, content: v})}
                    />
                </Modal>
            }
        </div>
    )
}

export default TextTemplates