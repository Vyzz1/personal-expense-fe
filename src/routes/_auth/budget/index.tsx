import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Col,
  Empty,
  Flex,
  Pagination,
  Result,
  Row,
  Spin,
  type PaginationProps,
} from "antd";
import Text from "antd/es/typography/Text";
import Title from "antd/es/typography/Title";
import { BudgetStats } from "./-components/budget-stats";
import { BudgetFilters } from "./-components/budget-filters";
import { BudgetCard } from "./-components/budget-card";
import { PlusOutlined } from "@ant-design/icons";
import z from "zod";
import { commonPageQuery } from "#/shared/pageSearch";
import { useApiQuery } from "#/hooks/useApiQuery";
import { type Budget, type BudgetsApiResponse } from "#/models/buget";
import { useState } from "react";
import { BudgetDrawer } from "./-components/create/budget-drawer";
import RefreshButton from "#/components/shared/refresh-button";

const pageQuery = commonPageQuery.extend({
  categoryIds: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "EXCEEDED"]).optional(),
});

export const Route = createFileRoute("/_auth/budget/")({
  component: RouteComponent,
  validateSearch: pageQuery,
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const navigate = Route.useNavigate();

  const {
    data: budgets,
    isLoading: isBudgetLoading,
    isError: isBudgetError,
    refetch,
  } = useApiQuery<BudgetsApiResponse>(["budgets", JSON.stringify(searchParams)], "/budgets", {
    axiosConfig: {
      params: searchParams,
    },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (current, pageSize) => {
    navigate({
      search: {
        ...searchParams,
        page: current - 1,
        size: pageSize,
      },
    });
  };

  if (isBudgetError) {
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

  if (isBudgetLoading) {
    return (
      <div className="flex items-center min-h-screen justify-center">
        <Spin size="large" tip="Loading budgets..." />
      </div>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto">
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              Budgets
            </Title>
            <Text type="secondary">
              Monitor and control your personal expense tracking seamlessly.
            </Text>
          </div>

          <Flex wrap gap="16px" align="center">
            <RefreshButton onRefresh={() => refetch()} />
            <Button
              type="primary"
              size="medium"
              icon={<PlusOutlined />}
              style={{ borderRadius: "8px" }}
              onClick={() => {
                setSelectedBudget(null);
                setFormOpen(true);
              }}
            >
              Create Budget
            </Button>
          </Flex>
        </div>

        {/* Summary Statistics */}
        <BudgetStats budgets={budgets?.data.content || []} />

        {/* Toolbar / Filters */}
        <BudgetFilters />

        {budgets?.data.content.length === 0 && <Empty />}

        {/* Budget Cards Grid */}
        <Row gutter={[24, 24]}>
          {budgets?.data.content.map((budget) => (
            <Col xs={24} sm={12} lg={8} key={budget.id}>
              <BudgetCard
                budget={budget}
                onEdit={(editedBudget) => {
                  setSelectedBudget(editedBudget);
                  setFormOpen(true);
                }}
                onDelete={() => {
                  refetch();
                }}
              />
            </Col>
          ))}
        </Row>
      </div>
      <BudgetDrawer
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        budgetId={selectedBudget?.id || undefined}
        initialData={selectedBudget as Partial<Budget> | undefined}
      />

      <div className="flex items-center justify-end mt-8">
        <Pagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          defaultCurrent={budgets?.data?.page! + 1 || 1}
          total={budgets?.data.totalElements || 0}
        />
      </div>
    </section>
  );
}
