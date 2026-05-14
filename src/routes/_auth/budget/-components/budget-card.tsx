// BudgetCard.tsx
import React from "react";
import { Card, Typography, Space, Tooltip, Tag, Button } from "antd";
import { EditOutlined, RightOutlined } from "@ant-design/icons";
import type { Budget } from "#/models/buget";
import { formatCurrency } from "#/utils/formatter";
import ConfirmDelete from "#/components/shared/confirm-delete";
import { Trash2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { BudgetProgress } from "./budget-progress";

const { Text, Title } = Typography;

interface Props {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budget: Budget) => void;
}

export const BudgetCard: React.FC<Props> = ({ budget, onEdit, onDelete }) => {
  const remaining = budget.limitAmount - budget.spentAmount;
  const isExceeded = remaining < 0;
  const thresholdLabel =
    budget.thresholdPercentage !== undefined ? `${budget.thresholdPercentage}%` : "Not set";

  return (
    <Card
      hoverable
      style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #f0f0f0" }}
      bodyStyle={{ padding: "24px" }}
      actions={[
        <Tooltip title="Edit" key="edit">
          <EditOutlined onClick={() => onEdit?.(budget)} />
        </Tooltip>,
        <Tooltip title="Details" key="details">
          <RightOutlined />
        </Tooltip>,
        <Tooltip title="Delete" key="delete">
          <ConfirmDelete
            button={<Button type="link" danger icon={<Trash2 size={18} />} />}
            itemName={budget.name}
            url={`/budgets/${budget.id}`}
            onDeleted={async () => {
              onDelete?.(budget);
            }}
          />
        </Tooltip>,
      ]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {budget.name}
          </Title>
          <Space size={8} style={{ marginTop: "4px" }}>
            {budget.category?.name && (
              <Tag color="blue" bordered={false} style={{ borderRadius: "4px", margin: 0 }}>
                {budget.category.name}
              </Tag>
            )}
            <Tag color="gold" bordered={false} style={{ borderRadius: "4px", margin: 0 }}>
              Threshold: {thresholdLabel}
            </Tag>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {budget.period}
            </Text>
          </Space>
        </div>
        <StatusBadge status={budget.status} />
      </div>

      <BudgetProgress spent={budget.spentAmount} limit={budget.limitAmount} />

      <Space direction="vertical" size={0} style={{ width: "100%", marginTop: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">Spent / Limit</Text>
          <Text strong>
            {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.limitAmount)}
          </Text>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <Text type="secondary">Remaining</Text>
          <Text strong type={isExceeded ? "danger" : "success"}>
            {isExceeded ? "0" : formatCurrency(remaining)}
          </Text>
        </div>
      </Space>
    </Card>
  );
};
