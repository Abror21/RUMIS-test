import { Button, Checkbox, Typography } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import {ResourceFilterType, Resource as ResourceType} from '@/app/types/Resource';

const { Title } = Typography;

type SecondStepProps = {
    selectedRowKeys: React.Key[],
    setStep: Dispatch<SetStateAction<0 | 1>>,
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    resource: ResourceType | null
}

const SecondStep = ({resource, selectedRowKeys, setStep, setModalOpen}: SecondStepProps) => {
    const [selectedParameters, setSelectedParameters] = useState<string[]>([])

    const handleCheckbox = (id: string) => {
        if (selectedParameters.some(p => p === id)) {
            setSelectedParameters(selectedParameters.filter(p => p !== id))
        } else {
            setSelectedParameters([
                ...selectedParameters,
                id
            ])
        }
    }
    return (
        <div>
            <Title level={4}>Aizpildāmie resursi</Title>
            <p>Atlasīti {selectedRowKeys.length} resursi, <Button type="link" onClick={() => setStep(0)}>skatīt</Button></p>

            <Title level={4}>Aizpildāmie parametri</Title>
            {resource && resource.resourceParameters.map(param => (
                <div key={param.id} className="grid grid-cols-[0.1fr,1fr,1fr] py-3 border-b border-gray">
                    <Checkbox checked={selectedParameters.some(p => p === param.id)} onChange={() => handleCheckbox(param.id)}/>
                    <div>
                        <b>{param.parameter.value}</b>
                    </div>
                    <div>{param.value}</div>
                </div>
            ))}
            <div className='flex justify-between mt-2'>
                <div className="flex gap-2">
                    <Button onClick={() => {setModalOpen(false)}}>Atcelt</Button>
                    <Button onClick={() => setStep(0)}>Atpakaļ</Button>

                </div>
                <Button type="primary" onClick={() => {}}>Aizpildīt</Button>
            </div>
        </div>
    )
}

export default SecondStep