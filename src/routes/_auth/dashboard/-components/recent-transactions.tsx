import { useApiQuery } from "#/hooks/useApiQuery";
import { type TransactionApiPaginationResponse } from "#/models/transaction";
import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";
import { List, Typography, Button, Space, Tag, Empty, Skeleton } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

const { Text } = Typography;

export default function RecentTransactions() {
  const { month, year } = useDashboardMonthYearStore();

  const { data, isLoading, error } =
    useApiQuery<TransactionApiPaginationResponse>(
      ["dashboard", "recent-transactions", month, year],
      "/transactions",
      {
        axiosConfig: {
          params: {
            page: 0,
            size: 5,
            sortBy: "occurredAt",
            sortOrder: "desc",
            month,
            year,
          },
        },
      },
    );

  const transactions = data?.data.content ?? [];

  if (error) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Text strong className="text-lg">
          Recent Transactions in{" "}
          {format(new Date(year, month - 1), "MMMM yyyy")}
        </Text>

        <Link to="/transaction">
          <Button type="link" icon={<ArrowRightOutlined />} className="p-0">
            View all
          </Button>
        </Link>
      </div>

      {/* List */}
      <List
        dataSource={transactions}
        locale={{
          emptyText: isLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <Empty description="No transactions" />
          ),
        }}
        renderItem={(item) => (
          <List.Item className="px-0">
            <div className="w-full flex items-center justify-between">
              {/* Left */}
              <Space direction="vertical" size={0}>
                <Text strong className="text-sm">
                  {item.description}
                </Text>

                <Space size="small">
                  <Tag color="blue">{item.category?.name}</Tag>
                  <Text type="secondary" className="text-xs">
                    {dayjs(item.occurredAt).format("DD/MM/YYYY")}
                  </Text>
                </Space>
              </Space>

              {/* Right */}
              <p
                className={`text-sm font-semibold ${
                  item.type !== "EXPENSE" ? "text-red-500" : "text-green-500"
                }`}
              >
                {item.type === "EXPENSE" ? "" : "+"}${item.amount.toFixed(2)}
              </p>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
