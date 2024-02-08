import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Space
} from 'antd';

interface ButtonWithIconProps {
  label: string,
  event: () => void,
}

const ButtonWithIcon = ({ label, event }: ButtonWithIconProps) => {
  return (
    <Button
      onClick={event}
      type="primary"
      style={{ marginBottom: 16 }}
    >
      <Space>
        <PlusOutlined />
        { label }
      </Space>
    </Button>
  );
}

export { ButtonWithIcon };
