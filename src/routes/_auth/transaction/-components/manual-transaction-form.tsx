import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Typography,
  type InputNumberProps,
} from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import dayjs from "dayjs";
import { CategoryModal } from "../../category/-components/category-modal";
import { useEffect, useRef, useState } from "react";
import { useApiMutation } from "#/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import type { TransactionResponse } from "#/models/transaction";
import useBeforeUnload from "#/hooks/useBeforeUnload";
interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: TransactionResponse;
}

export default function ManualTransactionForm({
  open,
  onClose,
  transaction,
}: TransactionFormProps) {
  const [form] = Form.useForm();

  const radioOptions: CheckboxGroupProps<string>["options"] = [
    { label: "Expense", value: "EXPENSE" },
    { label: "Income", value: "INCOME" },
  ];

  const formatter: InputNumberProps<number>["formatter"] = (value) => {
    const [start, end] = `${value}`.split(".") || [];
    const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$ ${end ? `${v}.${end}` : `${v}`}`;
  };

  const queryClient = useQueryClient();

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch,
  } = useApiQuery<ApiResponse<Category[]>>(["categories"], "/categories", {});

  const categoryOptions =
    categoriesData?.data?.map((c) => ({
      label: c.name,
      value: c.id,
    })) || [];

  const apiUrl = transaction ? `/transactions/${transaction.id}` : "/transactions";
  const method = transaction ? "PUT" : "POST";  

  const { mutateAsync, isPending } = useApiMutation(apiUrl, method, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      message.success("Transaction created successfully");
      form.resetFields();
      onClose();
    },
    onError: (error: ApiErrorResponse) => {
      message.error(error.message || "Failed to create transaction");

      if (error.fieldErrors && error.fieldErrors.length > 0) {
        error.fieldErrors.forEach((fieldError) => {
          form.setFields([
            { name: fieldError.field, errors: [fieldError.message] },
          ]);
        });
      }
    },
  });

  useBeforeUnload(isPending);

  async function handleFormFinish(values: any) {
    const occurredAt = dayjs(values.occurredAt).toISOString();

    await mutateAsync({
      ...values,
      occurredAt,
    });
  }

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const amountInputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      form.setFieldValue("type", "EXPENSE");
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (transaction) {
      form.setFieldsValue({
        ...transaction,
        occurredAt: dayjs(transaction.occurredAt),
        categoryId: transaction.category.id,
      });
    }
  }, [transaction]);

  if (categoriesData?.data.length === 0) {
    return (
      <Drawer placement="right" onClose={onClose} open={open} size={600}>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Typography.Title level={4}>No categories found</Typography.Title>
          <Typography.Text>
            Please create a category before adding transactions.
          </Typography.Text>
          <Button
            type="primary"
            className="mt-6"
            onClick={() => {
              setIsCategoryModalOpen(true);
            }}
          >
            Create Category
          </Button>

          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            category={null}
            onSuccess={async () => {
              await refetch();
              setIsCategoryModalOpen(false);
            }}
          />
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer placement="right" onClose={onClose} open={open} size={600}>
      <Typography.Title level={4}>Enter transaction details</Typography.Title>

      <div className="mt-5">
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item
            name="type"
            rules={[
              { required: true, message: "Please select a transaction type" },
            ]}
          >
            <Radio.Group
              block
              options={radioOptions}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            style={{ marginBottom: 24 }}
            rules={[
              {
                required: true,
                message: "Please enter the transaction amount",
              },
            ]}
          >
            <InputNumber
              size="large"
              style={{
                width: "100%",
              }}
              ref={amountInputRef}
              suffix="USD"
              formatter={formatter}
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
              }
              placeholder="Enter amount"
              step={0.1}
            />
          </Form.Item>

          <div className="border-t border-gray-200 my-6" />
          <Form.Item
            name="description"
            label="Description"
            style={{ marginBottom: 24 }}
            rules={[
              {
                required: true,
                message: "Please enter the transaction description",
              },
            ]}
          >
            <Input size="large" placeholder="Enter description" type="text" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            style={{ marginBottom: 24 }}
            rules={[
              {
                required: true,
                message: "Please select a category for the transaction",
              },
            ]}
          >
            <Select
              placeholder="Select category"
              loading={isLoadingCategories}
              options={categoryOptions}
            />
          </Form.Item>
          <div className="border-t border-gray-200 my-4" />

          <Form.Item
            name="occurredAt"
            label="Occurred At"
            style={{ marginBottom: 24 }}
            rules={[
              {
                required: true,
                message: "Please enter the date and time of the transaction",
              },
            ]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              placeholder="Select date and time"
              disabledDate={(current) =>
                current && current.isAfter(dayjs(), "day")
              }
              disabledTime={(current) => {
                if (current && current.isSame(dayjs(), "day")) {
                  const now = dayjs();
                  return {
                    disabledHours: () =>
                      Array.from({ length: 24 }, (_, i) => i).filter(
                        (h) => h > now.hour(),
                      ),
                    disabledMinutes: (selectedHour) =>
                      selectedHour === now.hour()
                        ? Array.from({ length: 60 }, (_, i) => i).filter(
                            (m) => m > now.minute(),
                          )
                        : [],
                    disabledSeconds: (selectedHour, selectedMinute) =>
                      selectedHour === now.hour() &&
                      selectedMinute === now.minute()
                        ? Array.from({ length: 60 }, (_, i) => i).filter(
                            (s) => s > now.second(),
                          )
                        : [],
                  };
                }
                return {};
              }}
            />
          </Form.Item>

          <Flex justify="end" gap={12}>
            <Button htmlType="reset">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Save Transaction
            </Button>
          </Flex>
        </Form>
      </div>
    </Drawer>
  );
}
