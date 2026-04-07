import { Button, Dropdown } from "antd";
import {
  DownOutlined,
  FileExcelOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import ManualTransactionForm from "./manual-transaction-form";
import ImportCSVForm from "./import-csv-form";

const items = [
  {
    key: "manual",
    label: "Manual Entry",
    icon: <FormOutlined />,
  },
  {
    key: "csv",
    label: "Import CSV",
    icon: <FileExcelOutlined />,
  },
];

export default function AddTransactionBtn() {
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isCSVFormOpen, setIsCSVFormOpen] = useState(false);


  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "manual") {
      setIsManualFormOpen(true);
    }
    if (key === "csv") {
      setIsCSVFormOpen(true);
    }
  };

  return (
    <>
      <Dropdown menu={{ items, onClick: handleMenuClick }}>
        <Button type="primary">
          Add Transaction <DownOutlined />
        </Button>
      </Dropdown>

      <ManualTransactionForm
        open={isManualFormOpen}
        onClose={() => setIsManualFormOpen(false)}
      />

      <ImportCSVForm
        open={isCSVFormOpen}
        onClose={() => setIsCSVFormOpen(false)}
      />
    </>
  );
}
