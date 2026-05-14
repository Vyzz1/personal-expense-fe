import React, { useEffect, useState } from "react";
import { Space, Input, Select, Row, Col, Segmented } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import type { BudgetStatus } from "#/models/buget";
import {
  budgetSortDirectionOptions,
  budgetSortFieldOptions,
  budgetStatusOptions,
} from "../-constants";

const { Option } = Select;

export const BudgetFilters: React.FC = () => {
  const search = useSearch({ from: "/_auth/budget/" });
  const currentSortBy = search.sortBy ?? "createdAt";
  const currentSortOrder = (search.sortOrder ?? "desc") as "asc" | "desc";

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useApiQuery<ApiResponse<Category[]>>(["categories"], "/categories", {
    enabled: true,
  });

  const [localSearch, setLocalSearch] = useState(search.search || "");

  const navigate = useNavigate({});

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.search !== localSearch) {
        navigate({
          to: "/budget",
          search: {
            ...search,
            search: localSearch,
          },
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, navigate, search]);

  if (categoriesError) {
    return null;
  }

  return (
    <div style={{ marginBottom: "24px", width: "100%" }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={8} lg={6}>
          <Input
            placeholder="Search budgets..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            style={{ width: "100%", borderRadius: "8px" }}
            value={localSearch}
            allowClear
            onChange={(e) => {
              setLocalSearch(e.target.value);
            }}
          />
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Space wrap size="middle" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Select
              allowClear
              placeholder="Budget Status"
              style={{ minWidth: 140 }}
              value={search.status}
              onChange={(value: BudgetStatus) => {
                navigate({
                  to: "/budget",
                  search: {
                    ...search,
                    status: value,
                  },
                });
              }}
            >
              {budgetStatusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            <Select
              mode="multiple"
              allowClear
              placeholder="Category"
              style={{ minWidth: 200, maxWidth: 300 }}
              maxTagCount="responsive"
              value={search.categoryIds}
              loading={isCategoriesLoading}
              onChange={(value: string[]) => {
                navigate({
                  to: "/budget",
                  search: {
                    ...search,
                    categoryIds: value,
                  },
                });
              }}
            >
              {categories?.data.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Sort by"
              style={{ minWidth: 160 }}
              value={currentSortBy}
              onChange={(sortBy: string) => {
                navigate({
                  to: "/budget",
                  search: {
                    ...search,
                    sortBy,
                    sortOrder: currentSortOrder,
                  },
                });
              }}
            >
              {budgetSortFieldOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            <Segmented
              options={budgetSortDirectionOptions}
              value={currentSortOrder}
              onChange={(sortOrder) => {
                navigate({
                  to: "/budget",
                  search: {
                    ...search,
                    sortBy: currentSortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                  },
                });
              }}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};
