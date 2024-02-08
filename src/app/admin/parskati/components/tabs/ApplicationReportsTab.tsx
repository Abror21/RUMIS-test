import {
    Tabs,
    TabsProps,
} from 'antd';
import ApplicationsByResourceTargetPersonType from './ApplicationsByResourceTargetPersonType';
import ApplicationsBySocialStatus from './ApplicationsBySocialStatus';
import ApplicationsByClassGroup from './ApplicationsByClassGroup';

const ApplicationReportsTab = () => {
    const tabsData: TabsProps['items'] = [
        {
            key: '1',
            label: 'Resursa lietotāja veida variācija',
            children: <ApplicationsByResourceTargetPersonType />
        },
        {
            key: '2',
            label: 'Sociālā atbalstāmā grupa (Atbilst) variācija',
            children: <ApplicationsBySocialStatus />
        },
        {
            key: '3',
            label: 'Klases/grupas variācija',
            children: <ApplicationsByClassGroup />
        },
    ]
    return (
        <Tabs defaultActiveKey="1" items={tabsData} />
    )
}

export default ApplicationReportsTab