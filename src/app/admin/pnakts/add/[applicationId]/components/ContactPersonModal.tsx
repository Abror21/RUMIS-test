import { Resource } from "@/app/types/Resource"
import { AppConfig } from "@/app/utils/AppConfig"
import useQueryApiClient from "@/app/utils/useQueryApiClient"
import { Button, Form, Modal, Select, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import MoreResourcesFilters from "./MoreResourcesFilters"
import { ClassifierResponse } from "@/app/types/Classifiers"
import { SelectOption } from "@/app/types/Antd"
import { ConsoleSqlOutlined } from "@ant-design/icons"

type ContactPersonModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    options: SelectOption[]
    submit: Function
    usedIds: string[]
}

const ContactPersonModal = ({setModalOpen, options, submit, usedIds}: ContactPersonModalProps) => {
    const [form] = Form.useForm();

    const person = Form.useWatch('person', form)

    const availableOptions = useMemo(() => {
        return options.filter(option => !usedIds.some(id => id === option.value))
    }, [])
  
    return (
        <Modal
            open={true}
            title="Kontaktpersonas"
            onCancel={() => setModalOpen(false)}
            footer={[
              <Button type="primary" key="cancel" onClick={() => submit(person)} disabled={!person}>
                Pievienot
              </Button>,
            ]}
        >
            <Form form={form}>
                <Form.Item name="person">
                    <Select options={availableOptions}/>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ContactPersonModal