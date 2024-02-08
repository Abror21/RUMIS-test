'use client'

import SortableTable, { SortableTableItem } from "@/app/components/SortableTable"
import { TColumn, createApplicationListExcelFile, getAllItemsFromList } from "@/app/utils/utils"
import { Modal } from "antd"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { Dispatch, SetStateAction } from "react"

type ExportModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    initialColumns: {
        key: string,
        name: string,
        isEnabled: boolean
    }[]
    data: any[]
    exportFunction: (data: any[], columns: TColumn[]) => void
    url: string
    filters: any
}

const ExportModal = ({setModalOpen, initialColumns, data, exportFunction, url, filters}: ExportModalProps) => {
    const { data: sessionData } = useSession();
    
    const handleOk = async (columns: SortableTableItem[]) => {
        const parsedColumns = columns.filter(col => col.isEnabled).map(col => ({...col, title: col.name}))
        
        const items = await getAllItemsFromList(url, filters, sessionData as Session)
        exportFunction(items, parsedColumns)

        setModalOpen(false)
    }
    return (
        <Modal
            open={true}
            footer={false}
            onCancel={() => setModalOpen(false)}
        >
            <SortableTable 
              initialData={initialColumns} 
              onCancel={() => setModalOpen(false)}
              onSubmit={(columns: SortableTableItem[]) => handleOk(columns)}  
            />
        </Modal>
    )
}

export default ExportModal