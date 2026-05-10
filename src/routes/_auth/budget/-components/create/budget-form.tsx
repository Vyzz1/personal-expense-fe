// src/components/Budget/BudgetForm.tsx
import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  type FormInstance,
  Skeleton,
  type InputNumberProps,
} from "antd";
import { useApiQuery } from "#/hooks/useApiQuery";
import type { BudgetFormData } from "#/models/buget";
import type { Category } from "#/models/category";

const { Option } = Select;

interface BudgetFormProps {
  form: FormInstance<BudgetFormData>;
  onFinish: (values: BudgetFormData) => void;
  initialValues?: Partial<BudgetFormData>;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ form, onFinish, initialValues }) => {
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useApiQuery<
    ApiResponse<Category[]>
  >(["categories"], "/categories", {
    enabled: true,
  });
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
    </Form>
  );
};
