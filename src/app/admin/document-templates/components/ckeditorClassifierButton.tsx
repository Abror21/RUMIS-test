import { ClassifierResponse } from "@/app/types/Classifiers";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Empty, Space } from "antd";
import type { MenuProps } from 'antd';

const CkeditorClissifierButton = ({ handleClick = () => { }, values }: { handleClick: Function; values: [] | null; }) => {
    let valueList;
    if (values && values.length > 0) {
        valueList = values?.map((value: ClassifierResponse, index: number) => {
            return {
                label: value?.value,
                key: `${index}@{{${value?.code}}}`,
                onClick: (e: { label: string; key: string }) => handleClick(e.key.substring(e.key.indexOf('@') + 1))
            }
        })
    } else {
        valueList = [{
            label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            key: ''
        }]
    }
    //@ts-ignore
    const items: MenuProps['items'] = valueList;

    return (
        <Dropdown rootClassName="ckeditor-classifier-button-modal" menu={{ items }} trigger={['click']}>
            <Button loading={false} type="text">
                <Space>Klasifikatori <DownOutlined /></Space>
            </Button>
        </Dropdown>
    )
};

export default CkeditorClissifierButton;