// src/components/Budget/BudgetForm.tsx
import React from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  type FormInstance,
  Space,
  Skeleton,
  type InputNumberProps,
  Typography,
} from "antd";
import { useApiQuery } from "#/hooks/useApiQuery";
import type { BudgetFormData } from "#/models/buget";
import type { Category } from "#/models/category";
import { formatCurrency } from "#/utils/formatter";

const { Option } = Select;
const { Text } = Typography;

interface BudgetFormProps {
  form: FormInstance<BudgetFormData>;
  onFinish: (values: BudgetFormData) => void;
  initialValues?: Partial<BudgetFormData>;
  spentAmount?: number;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  form,
  onFinish,
  initialValues,
  spentAmount,
}) => {
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useApiQuery<
    ApiResponse<Category[]>
  >(["categories"], "/categories", {
    enabled: true,
  });
  const watchedLimitAmount = Form.useWatch("limitAmount", form);
  const watchedThresholdPercentage = Form.useWatch("thresholdPercentage", form);

  const limitAmount = watchedLimitAmount ?? initialValues?.limitAmount ?? 0;
  const thresholdPercentage = watchedThresholdPercentage ?? initialValues?.thresholdPercentage ?? 0;
  const hasRelevantChange =
    spentAmount !== undefined &&
    (watchedLimitAmount !== undefined || watchedThresholdPercentage !== undefined) &&
    (watchedLimitAmount !== initialValues?.limitAmount ||
      watchedThresholdPercentage !== initialValues?.thresholdPercentage);
  const thresholdAmount = limitAmount * (thresholdPercentage / 100);
  const usage =
    thresholdAmount > 0 && spentAmount !== undefined ? spentAmount / thresholdAmount : 0;
  const projectedStatus =
    spentAmount !== undefined && spentAmount > thresholdAmount ? "EXCEEDED" : "ACTIVE";

  const formatter: InputNumberProps<number>["formatter"] = (value) => {
    const [start, end] = `${value}`.split(".") || [];
    const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$ ${end ? `${v}.${end}` : `${v}`}`;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      requiredMark="optional"
      style={{ marginTop: "16px" }}
    >
      <Form.Item
        label={<span style={{ fontWeight: 500 }}>Budget Name</span>}
        name="name"
        rules={[
          { required: true, message: "Please enter a budget name." },
          { whitespace: true, message: "Name cannot be empty." },
        ]}
      >
        <Input
          placeholder="e.g. Monthly Groceries"
          size="large"
          autoFocus
          style={{ borderRadius: "8px" }}
        />
      </Form.Item>

      <Form.Item label={<span style={{ fontWeight: 500 }}>Category</span>} name="categoryId">
        {isCategoriesLoading ? (
          <Skeleton.Input active block size="large" style={{ borderRadius: "8px" }} />
        ) : (
          <Select
            placeholder="Select a category (Optional)"
            size="large"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ borderRadius: "8px" }}
          >
            {categoriesResponse?.data?.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>

      <Form.Item
        label={<span style={{ fontWeight: 500 }}>Limit Amount</span>}
        name="limitAmount"
        rules={[
          { required: true, message: "Please specify the limit amount." },
          {
            validator: async (_, value) => {
              if (value !== undefined && value <= 0) {
                throw new Error("Limit amount must be greater than 0.");
              }
            },
          },
        ]}
      >
        <InputNumber
          size="large"
          placeholder="0"
          style={{ width: "100%", borderRadius: "8px" }}
          min={0}
          suffix="USD"
          formatter={formatter}
          parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
        />
      </Form.Item>

      <Form.Item
        label={<span style={{ fontWeight: 500 }}>Threshold Percentage</span>}
        name="thresholdPercentage"
        rules={[
          { required: true, message: "Please specify the threshold percentage." },
          {
            validator: async (_, value) => {
              if (value !== undefined && (value < 0 || value > 100)) {
                throw new Error("Threshold percentage must be between 0 and 100.");
              }
            },
          },
        ]}
      >
        <InputNumber
          size="large"
          placeholder="80"
          style={{ width: "100%", borderRadius: "8px" }}
          min={0}
          max={100}
          suffix="%"
        />
      </Form.Item>

      {hasRelevantChange && (
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>Preview</span>}
          bodyStyle={{ padding: "16px" }}
          style={{
            marginTop: "8px",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <Text type="secondary">Threshold amount</Text>
              <Text strong>{formatCurrency(thresholdAmount)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <Text type="secondary">Current spent</Text>
              <Text strong>{formatCurrency(spentAmount)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <Text type="secondary">Usage vs threshold</Text>
              <Text strong>{thresholdAmount > 0 ? `${usage.toFixed(2)}x` : "N/A"}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <Text type="secondary">Projected status</Text>
              <Text strong type={projectedStatus === "EXCEEDED" ? "danger" : "success"}>
                {projectedStatus}
              </Text>
            </div>
          </Space>
        </Card>
      )}
    </Form>
  );
};
