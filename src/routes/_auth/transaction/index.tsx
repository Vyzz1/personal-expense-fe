import ConfirmDelete from "#/components/shared/confirm-delete";
import { useApiQuery } from "#/hooks/useApiQuery";
import {
  type TransactionApiPaginationResponse,
  type TransactionResponse,
} from "#/models/transaction";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Flex,
  Input,
  Table,
  Typography,
  DatePicker,
  type TablePaginationConfig,
  Result,
} from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import { format } from "date-fns";
import { Edit, Trash2, Search, XIcon } from "lucide-react";
import { z } from "zod";
import CategorySelect from "./-components/category-select";
import AddTransactionBtn from "./-components/add-transction-btn";
import ManualTransactionForm from "./-components/manual-transaction-form";

const transactionPageParams = z.object({
  page: z.coerce.number().min(0).default(0).catch(0),
  size: z.coerce.number().min(10).default(20).catch(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  type: z.array(z.enum(["INCOME", "EXPENSE"])).optional(),
});

export const Route = createFileRoute("/_auth/transaction/")({
  component: RouteComponent,
  validateSearch: transactionPageParams,
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const {
    page,
    size,
    sortBy,
    sortOrder,
    search,
    fromDate,
    toDate,
    categoryIds,
    type,
  } = searchParams;

  const navigate = Route.useNavigate();

  const [localSearch, setLocalSearch] = useState(search || "");

  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<
    TransactionResponse | undefined
  >(undefined);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== localSearch) {
        navigate({
          search: (prev: any) => ({
            ...prev,
            search: localSearch || undefined,
            page: 0,
          }),
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, navigate, search]);

  const { data, isLoading, error, refetch } =
    useApiQuery<TransactionApiPaginationResponse>(
      ["transactions", JSON.stringify(searchParams)],
      "/transactions",
      {
        enabled: true,
        axiosConfig: {
          params: {
            page,
            size,
            sortBy,
            sortOrder,
            description: search,
            fromDate,
            toDate,
            categoryIds,
            type,
          },
        },
      },
    );

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load transactions"
        subTitle="An error occurred while fetching your transactions. Please try again."
        extra={
          <Button type="primary" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const columns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      sortOrder: (sortBy === "amount"
        ? sortOrder === "asc"
          ? "ascend"
          : "descend"
        : undefined) as "ascend" | "descend" | undefined,
      render: (amount: number) => (
        <span
          className={
            amount >= 0 ? "text-green-600 font-semibold" : "text-red-600"
          }
        >
          $ {amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "Occurred At",
      dataIndex: "occurredAt",
      key: "occurredAt",
      sorter: true,
      sortOrder: (sortBy === "occurredAt"
        ? sortOrder === "asc"
          ? "ascend"
          : "descend"
        : undefined) as "ascend" | "descend" | undefined,
      render: (text: string) => format(new Date(text), "PPP p"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: (sortBy === "createdAt"
        ? sortOrder === "asc"
          ? "ascend"
          : "descend"
        : undefined) as "ascend" | "descend" | undefined,
      render: (text: string) => format(new Date(text), "PPP p"),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text: string) => (
        <Badge
          color={text === "INCOME" ? "green" : "red"}
          text={text
            .split("_")
            .map((word) => word[0] + word.slice(1).toLowerCase())
            .join(" ")}
        />
      ),
      filters: [
        { text: "Income", value: "INCOME" },
        { text: "Expense", value: "EXPENSE" },
      ],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Flex gap={5}>
          <Button
            type="link"
            icon={<Edit size={18} />}
            onClick={() => {
              setEditingTransaction(record);
              setIsManualFormOpen(true);
            }}
          />
          <ConfirmDelete
            button={<Button type="link" danger icon={<Trash2 size={18} />} />}
            itemName={record.description}
            url={`/transactions/${record.id}`}
            onDeleted={async () => {
              await refetch();
            }}
          />
        </Flex>
      ),
    },
  ];

  function handleTableChange(
    pagination: TablePaginationConfig,
    filter: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
  ) {
    let newSortBy: string | undefined = undefined;
    let newSortOrder: "asc" | "desc" | undefined = undefined;

    if (!Array.isArray(sorter) && sorter.order) {
      newSortBy = sorter.field as string;
      newSortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    navigate({
      search: {
        ...searchParams,
        page: pagination.current ? pagination.current - 1 : 0,
        size: pagination.pageSize || 20,
        sortBy: newSortBy,
        sortOrder: newSortOrder,
        type: filter.type ? (filter.type as ("INCOME" | "EXPENSE")[]) : undefined,
      },
    });

    console.log("Table changed:", pagination, filter, sorter);
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <div className="mb-6">
            <Typography.Title level={1}>Your Transactions</Typography.Title>
            <Typography.Text>
              Here you can view all your transactions. You can also add, edit,
              or delete transactions as needed.
            </Typography.Text>
          </div>

          <div className="flex items-center gap-3">
            <AddTransactionBtn />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row flex-wrap gap-4 items-center">
          <Input
            prefix={<Search size={16} className="text-gray-400 mr-1" />}
            allowClear
            placeholder="Search transactions..."
            className="w-full md:w-72"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />

          <div className="hidden md:block w-px h-6 bg-gray-200" />

          <DatePicker.RangePicker
            className="w-full md:w-auto"
            value={
              fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : undefined
            }
            onChange={(_, dateStrings) => {
              if (!dateStrings) {
                navigate({
                  search: (prev: any) => ({
                    ...prev,
                    fromDate: undefined,
                    toDate: undefined,
                    page: 0,
                  }),
                });
                return;
              }

              navigate({
                search: (prev: any) => ({
                  ...prev,
                  fromDate: dateStrings[0] || undefined,
                  toDate: dateStrings[1] || undefined,
                  page: 0,
                }),
              });
            }}
          />

          <div className="hidden md:block w-px h-6 bg-gray-200" />

          <div className="w-full md:flex-1 min-w-50">
            <CategorySelect
              defaultValue={categoryIds}
              onChange={(value) =>
                navigate({
                  search: (prev: any) => ({
                    ...prev,
                    categoryIds: value.length > 0 ? value : undefined,
                    page: 0,
                  }),
                })
              }
            />
          </div>

          <Button
            type="link"
            icon={<XIcon size={16} />}
            onClick={() => {
              setLocalSearch("");
              navigate({
                search: {
                  page: 0,
                  size,
                },
              });
            }}
          >
            Clear All
          </Button>
        </div>

        <Table
          onChange={handleTableChange}
          columns={columns}
          dataSource={data?.data.content || []}
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          rowKey="id"
          pagination={{
            current: page + 1,
            pageSize: size,
            total: data?.data.totalElements || 0,
            showSizeChanger: true,
          }}
        />
      </div>

      <ManualTransactionForm
        key={editingTransaction ? editingTransaction.id : "new"}
        open={isManualFormOpen}
        onClose={() => {
          setIsManualFormOpen(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
      />
    </section>
  );
}
