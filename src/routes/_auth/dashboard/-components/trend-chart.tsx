import { useApiQuery } from "#/hooks/useApiQuery";
import { type ThreeMonthExpenseApiResponse } from "#/models/expense";
import { Card, Skeleton } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "#/utils/formatter";
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: ValueType;
    payload?: {
      changePercentage?: number;
    };
  }>;
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const current = payload.find((p) => p.dataKey === "totalAmount");
  const previous = payload.find((p) => p.dataKey === "previousTotalAmount");
  const change = payload[0]?.payload?.changePercentage ?? 0;
  const isUp = change >= 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[10px] py-3 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-45">
      <p className="font-semibold text-[13px] mb-2 text-gray-800">{label}</p>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-6">
          <span className="text-xs text-indigo-500">This month</span>
          <span className="text-xs font-semibold text-gray-800">
            {formatCurrency(Number(current?.value ?? 0))}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-xs text-indigo-300">Prev month</span>
          <span className="text-xs font-semibold text-gray-500">
            {formatCurrency(Number(previous?.value ?? 0))}
          </span>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex justify-between">
          <span className="text-[11px] text-gray-500">Change</span>
          <span
            className={`text-[11px] font-semibold ${isUp ? "text-red-500" : "text-green-500"}`}
          >
            {isUp ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function TrendChart() {
  const { month, year } = useDashboardMonthYearStore();

  const { data, isLoading, error } = useApiQuery<ThreeMonthExpenseApiResponse>(
    ["dashboard", "three-month-trend", month, year],
    "/expenses/compare",
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

  if (data?.data.length === 1 || data?.data.length === 0) {
    return null; // Don't show chart if only current month data is available (e.g. for new users)
  }

  const chartData = (data?.data ?? [])
    .sort(
      (a, b) =>
        new Date(a.year, a.month - 1).getTime() -
        new Date(b.year, b.month - 1).getTime(),
    )
    .map((item) => ({
      label: `${MONTH_NAMES[item.month - 1]} ${item.year}`,
      totalAmount: item.totalAmount,
      previousTotalAmount: item.previousTotalAmount,
      changePercentage: item.changePercentage,
    }));

  return (
    <Card className="rounded-xl border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[15px] font-semibold text-gray-800 m-0">
            Expense Trend
          </p>
          <p className="text-xs text-gray-500 mt-0.5 mb-0">
            Last 3 months comparison
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-500">This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-300" />
            <span className="text-xs text-gray-500">Prev month</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="previousTotalAmount"
              stroke="#a5b4fc"
              strokeWidth={2}
              fill="url(#gradPrevious)"
              dot={false}
              activeDot={{ r: 4, fill: "#a5b4fc", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="totalAmount"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradCurrent)"
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default TrendChart;
