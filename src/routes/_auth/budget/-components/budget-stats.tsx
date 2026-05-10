// BudgetStats.tsx
import React, { useMemo } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { WalletOutlined, PieChartOutlined, FallOutlined, WarningOutlined } from "@ant-design/icons";
import { formatCurrency } from "#/utils/formatter";
import type { Budget } from "#/models/buget";

interface BudgetStatProps {
  budgets: Budget[];
}

export const BudgetStats: React.FC<BudgetStatProps> = ({ budgets }) => {
  const totalBudgets = budgets.length;
  const totalLimitAmount = useMemo(
    () => budgets.reduce((sum, b) => sum + b.limitAmount, 0),
    [budgets]
  );
  const totalSpentAmount = useMemo(
    () => budgets.reduce((sum, b) => sum + b.spentAmount, 0),
    [budgets]
  );
  const exceededBudgets = useMemo(
    () => budgets.filter((b) => b.status === "EXCEEDED").length,
    [budgets]
  );

  const stats = [
    {
      title: "Total Budgets",
      value: totalBudgets,
      icon: <WalletOutlined style={{ color: "#1890ff" }} />,
    },
    {
      title: "Total Limit Amount",
      value: totalLimitAmount,
      prefix: "$",
      icon: <PieChartOutlined style={{ color: "#52c41a" }} />,
    },
    {
      title: "Total Spent Amount",
      value: totalSpentAmount,
      prefix: "$",
      icon: <FallOutlined style={{ color: "#faad14" }} />,
    },
    {
      title: "Exceeded Budgets",
      value: exceededBudgets,
      icon: <WarningOutlined style={{ color: "#f5222d" }} />,
      valueStyle: { color: "#cf1322" },
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            bordered={false}
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.icon}
              valueStyle={{ fontWeight: 600, marginTop: "8px", ...stat.valueStyle }}
              formatter={(val) => (stat.prefix ? formatCurrency(Number(val)) : val)}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
