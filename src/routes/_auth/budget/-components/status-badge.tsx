import React from "react";
import { Tag } from "antd";
import type { Budget } from "#/models/buget";

interface Props {
  status: Budget["status"];
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = {
    ACTIVE: { color: "green", text: "ACTIVE" },
    EXPIRED: { color: "default", text: "EXPIRED" },
    EXCEEDED: { color: "red", text: "EXCEEDED" },
  };

  const { color, text } = config[status] || config.EXPIRED;
  return (
    <Tag color={color} style={{ borderRadius: "12px", fontWeight: 600 }}>
      {text}
    </Tag>
  );
};
