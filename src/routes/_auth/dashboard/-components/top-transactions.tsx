import { useApiQuery } from "#/hooks/useApiQuery";
import type { TransactionApiPaginationResponse } from "#/models/transaction";
import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";
import { formatCurrency } from "#/utils/formatter";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Card, Skeleton, Empty, Button } from "antd";
import { format } from "date-fns";

export default function TopTransactions({
  categoryId,
  categoryName,
}: {
  categoryId?: string;
  categoryName?: string;
}) {
  const { month, year } = useDashboardMonthYearStore();

  const { data, isLoading, error } =
    useApiQuery<TransactionApiPaginationResponse>(
      ["dashboard", "top-transactions", categoryId, month, year],
      "/transactions",
      {
        enabled: !!categoryId,
        axiosConfig: {
          params: {
            page: 0,
            size: 10,
            sortBy: "amount",
            sortOrder: "desc",
            categoryIds: categoryId ? [categoryId] : undefined,
            type: ["EXPENSE"],
            month,
            year,
          },
        },
      },
    );

  return (
    <Card
      className="rounded-xl border-gray-100 h-full"
      bodyStyle={{ padding: "20px 24px" }}
      title={
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-800 m-0">
              Top Transactions
            </h3>
            <p className="text-sm text-blue-500 mt-0.5 mb-0">
              {Boolean(data?.data.content.length) && `For ${categoryName}`}
            </p>
          </div>

          <Link to="/transaction">
            <Button type="link" icon={<ArrowRightOutlined />}>
              View all
            </Button>
          </Link>
        </div>
      }
    >
      {isLoading && <Skeleton active paragraph={{ rows: 5 }} />}
      {!isLoading && error && <Empty description="Failed to load" />}
      {!isLoading &&
        !error &&
        (!data?.data.content || data.data.content.length === 0) && (
          <Empty description="No transactions found" />
        )}
      {!isLoading &&
        !error &&
        data?.data.content &&
        data.data.content.length > 0 && (
          <div className="flex flex-col gap-4  overflow-y-auto max-h-95 pr-3 custom-scroll">
            {data.data.content.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <span
                    className="text-sm font-medium text-gray-800 truncate"
                    title={tx.description}
                  >
                    {tx.description}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(tx.occurredAt), "MMM d, yyyy")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-500 whitespace-nowrap">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
    </Card>
  );
}
