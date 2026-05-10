import React from "react";
import { Progress } from "antd";

interface Props {
  spent: number;
  limit: number;
}

export const BudgetProgress: React.FC<Props> = ({ spent, limit }) => {
  const percentage = (spent / limit) * 100;
  const displayPercentage = Math.min(percentage, 100);

  let strokeColor = "#52c41a"; // < 70% -> Green
  let status: "normal" | "exception" | "success" | "active" = "active";

  if (percentage >= 100) {
    status = "exception"; // 100% -> Exception/Error
  } else if (percentage >= 90) {
    strokeColor = "#f5222d"; // 90% - 100% -> Red
  } else if (percentage >= 70) {
    strokeColor = "#faad14"; // 70% - 90% -> Orange
  }

  return (
    <Progress
      percent={parseFloat(displayPercentage.toFixed(1))}
      strokeColor={status === "exception" ? undefined : strokeColor}
      status={status}
      style={{ marginBottom: "8px" }}
    />
  );
};
