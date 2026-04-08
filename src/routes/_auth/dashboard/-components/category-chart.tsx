import { useEffect, useState } from "react";
import { useApiQuery } from "#/hooks/useApiQuery";
import { type CategoryAnalyticsApiResponse } from "#/models/category";
import { formatCurrency } from "#/utils/formatter";
import { Card, Skeleton, Empty } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    value?: ValueType;
    payload?: {
      changePercentage?: number;
    };
  }>;
  label?: string | number;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const entry = item.payload as {
    name: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: item.color,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {entry.name}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 24 }}
        >
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Amount
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {formatCurrency(entry.totalAmount)}
          </span>
        </div>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 24 }}
        >
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Transactions
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {entry.transactionCount}
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            Share
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: item.color }}>
            {entry.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  name,
  color,
  percentage,
  amount,
  isActive,
  onClick,
}: {
  name: string;
  color: string;
  percentage: number;
  amount: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        cursor: onClick ? "pointer" : "default",
        opacity: isActive !== false ? 1 : 0.4,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {formatCurrency(amount)}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color,
            background: `${color}18`,
            padding: "1px 6px",
            borderRadius: 999,
          }}
        >
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function CategoryChart({
  selectedCategoryId,
  onCategorySelect,
}: {
  selectedCategoryId?: string;
  onCategorySelect?: (id: string, name: string) => void;
} = {}) {
  const { month, year } = useDashboardMonthYearStore();

  const [isUserSelected, setIsUserSelected] = useState(false);

  const { data, isLoading, error } = useApiQuery<CategoryAnalyticsApiResponse>(
    ["dashboard", "category-trends", month, year],
    "/categories/analysis",
    {
      axiosConfig: {
        params: {
          month,
          year,
        },
      },
    },
  );

  if (error) return null;

  const total = (data?.data ?? []).reduce((sum, c) => sum + c.totalAmount, 0);

  const chartData = (data?.data ?? [])
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item, i) => ({
      ...item,
      color: COLORS[i % COLORS.length],
      percentage: total > 0 ? (item.totalAmount / total) * 100 : 0,
    }));

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(year, month - 1),
  );

  const biggestCategory = chartData[0];

  useEffect(() => {
    if (biggestCategory && !selectedCategoryId && onCategorySelect) {
      onCategorySelect(biggestCategory.id, biggestCategory.name);
    }
  }, [biggestCategory, selectedCategoryId, onCategorySelect]);

  useEffect(() => {
    if (biggestCategory && onCategorySelect && !isUserSelected) {
      onCategorySelect(biggestCategory.id, biggestCategory.name);
    }
  }, [biggestCategory, onCategorySelect, isUserSelected]);

  useEffect(() => {
    setIsUserSelected(false);
  }, [month, year]);

  return (
    <Card
      style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}
      bodyStyle={{ padding: "20px 24px" }}
    >
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Spending by Category
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            margin: "2px 0 0",
          }}
        >
          {monthName} · {formatCurrency(total)} total
        </p>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : chartData.length === 0 ? (
        <Empty description="No category data" style={{ margin: "40px 0" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="totalAmount"
                strokeWidth={0}
                minAngle={3}
                onClick={(data) => {
                  setIsUserSelected(true);
                  if (onCategorySelect && data?.payload) {
                    onCategorySelect(data.payload.id, data.payload.name);
                  }
                }}
                style={{ cursor: onCategorySelect ? "pointer" : "default" }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    style={{
                      outline: "none",
                      opacity:
                        !selectedCategoryId || selectedCategoryId === entry.id
                          ? 1
                          : 0.4,
                      transition: "opacity 0.2s",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000 }}
                allowEscapeViewBox={{ x: true, y: true }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />

              {/* center label */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan
                  x="50%"
                  dy="-8"
                  style={{ fontSize: 13, fill: "#9ca3af" }}
                >
                  Total
                </tspan>
                <tspan
                  x="50%"
                  dy="22"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    fill: "var(--color-text-primary)",
                  }}
                >
                  {formatCurrency(total)}
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4">
            {chartData.map((item) => (
              <LegendItem
                key={item.id}
                name={item.name}
                color={item.color}
                percentage={item.percentage}
                amount={item.totalAmount}
                isActive={!selectedCategoryId || selectedCategoryId === item.id}
                onClick={() => {
                  setIsUserSelected(true);
                  if (onCategorySelect) {
                    onCategorySelect(item.id, item.name);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
