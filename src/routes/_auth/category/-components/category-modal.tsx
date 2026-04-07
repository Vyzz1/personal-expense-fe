import { useApiMutation } from "#/hooks/useApiMutation";
import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import { Form, Input, Modal, Select, message } from "antd";
import { useEffect } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) {
  const [form] = Form.useForm();

  const { data: categoriesData, isLoading: isLoadingCategories } = useApiQuery<
    ApiResponse<Category[]>
  >(["categories"], "/categories", {
    enabled: isOpen,
  });

  const parentOptions =
    categoriesData?.data
      ?.filter((c) => c.id !== category?.id)
      ?.map((c) => ({
        label: c.name,
        value: c.id,
      })) || [];

  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.setFieldValue("name", category.name);
        form.setFieldValue("parentId", category.parentId || null);
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, category, form]);

  const { mutateAsync, isPending } = useApiMutation(
    category ? `/categories/${category.id}` : "/categories",
    category ? "PUT" : "POST",
    {
      onSuccess: () => {
        message.success(
          `Category ${category ? "updated" : "created"} successfully`,
        );
      },
      onError: (error: ApiErrorResponse) => {
        if(error.fieldErrors && error.fieldErrors.length > 0) {
            error.fieldErrors.forEach((fieldError) => {
                form.setFields([
                    {
                        name: fieldError.field,
                        errors: [fieldError.message],
                    },
                ]);
            }
            );
            return;
        }
        message.error("An error occurred while saving the category.");
      },
    },
  );

  const handleSubmit = async (values: { name: string; parentId?: string }) => {
    try {
      if (category) {
        await mutateAsync({ ...values });
      } else {
        await mutateAsync(values);
      }
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={category ? "Edit Category" : "Add Category"}
      open={isOpen}
      onOk={form.submit}
      confirmLoading={isPending}
      onCancel={handleCancel}
      okText={category ? "Update" : "Create"}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: "Please enter a category name" }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>
        <Form.Item name="parentId" label="Parent Category">
          <Select
            placeholder="Select a parent category"
            allowClear
            loading={isLoadingCategories}
            options={parentOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
