import React, { useEffect } from "react";
import { Drawer, Button, Space, Form, message, Grid } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "#/hooks/useApiMutation";
import type { Budget, BudgetFormData } from "#/models/buget";
import { BudgetForm } from "./budget-form";

const { useBreakpoint } = Grid;

interface BudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId?: string;
  initialData?: Partial<Budget>;
}

export const BudgetDrawer: React.FC<BudgetDrawerProps> = ({
  isOpen,
  onClose,
  budgetId,
  initialData,
}) => {
  const [form] = Form.useForm<BudgetFormData>();
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  const isEditMode = !!budgetId;
  const drawerWidth = screens.md ? 520 : "100%";

  const apiUrl = isEditMode ? `/budgets/${budgetId}` : "/budgets";
  const method = isEditMode ? "PUT" : "POST";

  const { mutateAsync, isPending } = useApiMutation(apiUrl, method, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["budgets"],
      });
      message.success(`Budget ${isEditMode ? "updated" : "created"} successfully.`);
      handleClose();
    },
    onError: (error: ApiErrorResponse) => {
      message.error(error.message || `Failed to ${isEditMode ? "update" : "create"} budget.`);

      if (error.fieldErrors && error.fieldErrors.length > 0) {
        error.fieldErrors.forEach((fieldError) => {
          form.setFields([
            { name: fieldError.field as keyof BudgetFormData, errors: [fieldError.message] },
          ]);
        });
      }
    },
  });

  const onSubmit = async (values: BudgetFormData) => {
    await mutateAsync(values);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        ...initialData,
        categoryId: initialData.category?.id,
      });
    } else if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, initialData, form]);

  return (
    <Drawer
      title={
        <span style={{ fontSize: "18px", fontWeight: 600 }}>
          {isEditMode ? "Edit Budget" : "Create New Budget"}
        </span>
      }
      placement="right"
      width={drawerWidth}
      onClose={handleClose}
      open={isOpen}
      destroyOnClose
      maskClosable={!isPending}
      keyboard={!isPending}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0" }}>
          <Space>
            <Button onClick={handleClose} disabled={isPending} style={{ borderRadius: "8px" }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isPending}
              style={{ borderRadius: "8px", fontWeight: 500, minWidth: "120px" }}
            >
              {isEditMode ? "Save Changes" : "Create Budget"}
            </Button>
          </Space>
        </div>
      }
    >
      <BudgetForm form={form} onFinish={onSubmit} />
    </Drawer>
  );
};
