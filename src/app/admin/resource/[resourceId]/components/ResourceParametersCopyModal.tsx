import { Modal, Typography } from "antd"
import { Dispatch, SetStateAction, useState } from "react"
import FirstStep from './steps/FirstStep'
import {Resource as ResourceType} from '@/app/types/Resource';
import SecondStep from "./steps/SecondStep";

type ResourceParametersCopyModalProps = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
    resource: ResourceType | null
}

const { Title } = Typography;

const ResourceParametersCopyModal = ({setModalOpen, resource}: ResourceParametersCopyModalProps) => {
    const [step, setStep] = useState<0 | 1>(0)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const steps = [
        <FirstStep 
            resource={resource} 
            setModalOpen={setModalOpen} 
            setStep={setStep}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
        />, 
        <SecondStep 
            setStep={setStep}
            selectedRowKeys={selectedRowKeys}
            setModalOpen={setModalOpen}
            resource={resource}
        />
    ]
    return (
        <Modal
            open={true}
            footer={false}
            title="Resursu datu kopēšana"
            onCancel={() => setModalOpen(false)}
            width={900}
        >
            <div>
                <div>
                    <Title level={4}>Pamata resurss</Title>
                    <p><b>{resource?.resourceName}</b> {resource?.modelName?.value} ({resource?.resourceNumber})</p>
                    <p>S.n. {resource?.serialNumber}</p>
                    <p>Inventāra Nr. {resource?.inventoryNumber}</p>
                </div>
                {steps[step]}
            </div>
        </Modal>
    )
}

export default ResourceParametersCopyModal