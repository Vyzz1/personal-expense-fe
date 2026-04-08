import { useApiQuery } from "#/hooks/useApiQuery";
import type { MonthlyExpenseApiResponse } from "#/models/expense";
import { Card, Skeleton } from "antd";
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "#/utils/formatter";
import { format } from "date-fns";
import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";
function StatCard({
  title,
  value,
  icon,
  loading,
  trend,
  subtitle,
  color,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  loading: boolean;
  trend?: { value: number; label: string };
  subtitle?: string;
  color: string;
}) {
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
      bodyStyle={{ padding: "20px 24px" }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${color}18`, color }}
            >
              {icon}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-gray-800">
              {value}
            </span>
            {subtitle && (
              <span className="text-xs text-gray-400">{subtitle}</span>
            )}
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
              <span
                className="flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  background: isPositive ? "#fff1f0" : "#f6ffed",
                  color: isPositive ? "#ff4d4f" : "#52c41a",
                }}
              >
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function KeyMetrics() {
  const { month, year } = useDashboardMonthYearStore();
  const { data, isLoading, error } = useApiQuery<MonthlyExpenseApiResponse>(
    ["dashboard", "key-metrics", month, year],
    "/expenses/monthly",
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

  const metrics = data?.data;

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(year, month - 1),
  );
  const yearName = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(
    new Date(year, month - 1),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-gray-700 m-0">
          {monthName} - {yearName} Overview
        </h2>
        {metrics?.lastCalculatedAt && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FieldTimeOutlined />
            Updated {format(metrics.lastCalculatedAt, "MMM d, yyyy, h:mm:ss a")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Expenses This Month"
          value={formatCurrency(metrics?.totalAmount ?? 0)}
          icon={<WalletOutlined />}
          loading={isLoading}
          color="#6366f1"
          trend={
            metrics
              ? {
                  value: metrics.changePercentage,
                  label: "vs last month",
                }
              : undefined
          }
          subtitle={`Previous: ${formatCurrency(metrics?.previousTotalAmount ?? 0)}`}
        />

        <StatCard
          title="vs Previous Month"
          value={formatCurrency(
            (metrics?.totalAmount ?? 0) - (metrics?.previousTotalAmount ?? 0),
          )}
          icon={<ArrowUpOutlined />}
          loading={isLoading}
          color="#f59e0b"
          subtitle={
            metrics
              ? `${metrics.changePercentage >= 0 ? "+" : ""}${Math.abs(metrics.changePercentage).toFixed(3)}% change`
              : undefined
          }
        />

        <StatCard
          title="Reporting Period"
          value={`${monthName} ${metrics?.year ?? year}`}
          icon={<CalendarOutlined />}
          loading={isLoading}
          color="#10b981"
          subtitle={
            metrics?.lastCalculatedAt
              ? `Refreshed ${format(metrics.lastCalculatedAt, "MMM d, yyyy, h:mm:ss a")}`
              : "Awaiting data"
          }
        />
      </div>
    </div>
  );
}
