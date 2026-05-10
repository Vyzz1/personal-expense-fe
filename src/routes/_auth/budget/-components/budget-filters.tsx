import React, { useEffect, useState } from "react";
import { Space, Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import type { BudgetStatus } from "#/models/buget";
import { budgetSortOptions, budgetStatusOptions } from "../-constants";

const { Option } = Select;

export const BudgetFilters: React.FC = () => {
  const search = useSearch({ from: "/_auth/budget/" });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useApiQuery<ApiResponse<Category[]>>(["categories"], "/categories", {
    enabled: true,
  });

  if (categoriesError) {
    return null;
  }

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
              value={`${search.sortBy}_${search.sortOrder}`}
              style={{ minWidth: 180 }}
              onChange={(value: string) => {
                const [sortBy, sortOrder] = value.split("_");
                navigate({
                  to: "/budget",
                  search: {
                    ...search,
                    sortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                  },
                });
              }}
            >
              {budgetSortOptions.map((option) => (
                <Option key={option.label} value={`${option.sortBy}_${option.sortOrder}`}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
