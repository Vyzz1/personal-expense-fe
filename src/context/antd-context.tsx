import { ConfigProvider } from "antd";

interface AntdContextProps {
  children: React.ReactNode;
}

export default function AntdContext({ children }: AntdContextProps) {
  return <ConfigProvider>{children}</ConfigProvider>;
}
