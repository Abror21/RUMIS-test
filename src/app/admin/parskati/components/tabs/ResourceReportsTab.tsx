import {
    Tabs,
    TabsProps,
} from 'antd';
import ResourcesByResourceSubType from './ResourcesByResourceSubType';
import ResourcesBySocialSupportResource from './ResourcesBySocialSupportResource';
import ResourcesByUsagePurposeType from './ResourcesByUsagePurposeType';
import ResourcesByTargetGroup from './ResourcesByTargetGroup';
import ResourcesByManufactureYearResource from './ResourcesByManufactureYearResource';

const ResourceReportsTab = () => {
    const tabsData: TabsProps['items'] = [
        {
            key: '1',
            label: 'Resursu paveidi',
            children: <ResourcesByResourceSubType />
        },
        {
            key: '2',
            label: 'Sociālie',
            children: <ResourcesBySocialSupportResource />
        },
        {
            key: '3',
            label: 'Izmantošanas mērķi',
            children: <ResourcesByUsagePurposeType />
        },
        {
            key: '4',
            label: 'Mērķu grupas',
            children: <ResourcesByTargetGroup />
        },
        {
            key: '5',
            label: 'Ražošanas gadi',
            children: <ResourcesByManufactureYearResource />
        },
    ]

    return (
        <Tabs defaultActiveKey="1" items={tabsData} />
    )
}

export default ResourceReportsTab