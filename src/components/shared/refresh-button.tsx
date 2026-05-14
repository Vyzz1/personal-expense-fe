import { SyncOutlined } from "@ant-design/icons";
import { Button, type ButtonProps } from "antd";

interface Props {
  onRefresh: () => void;
}

export default function RefreshButton({ onRefresh, ...buttonProps }: Props & ButtonProps) {
  return (
    <Button size="small" type="link" icon={<SyncOutlined />} onClick={onRefresh} {...buttonProps}>
      Refresh
    </Button>
  );
}
