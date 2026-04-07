import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Flex, Table, Typography } from "antd";
import { format } from "date-fns";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { CategoryModal } from "#/routes/_auth/category/-components/category-modal";
import ConfirmDelete from "#/components/shared/confirm-delete";

export const Route = createFileRoute("/_auth/category/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const showModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const { data, isLoading, error, refetch } = useApiQuery<
    ApiResponse<Category[]>
  >(["categories"], "/categories", {
    enabled: true,
  });

  const handleModalSuccess = async () => {
    await refetch();
  };

  if (error) {
    return (
      <div className="px-4 py-8">
        <Typography.Title level={2}>Error</Typography.Title>
        <Typography.Text type="danger">
          Failed to load categories. Please try again later.
        </Typography.Text>
      </div>
    );
  }

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Typography.Text>{text}</Typography.Text>,
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
      sortable: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => format(new Date(text), "PPP p"),
      sorter: (a: Category, b: Category) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortable: true,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => format(new Date(text), "PPP p"),
      sorter: (a: Category, b: Category) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      sortable: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Category) => (
        <Flex gap={8}>
          <Button
            type="link"
            onClick={() => showModal(record)}
            icon={<Edit size={18} />}
          />

          <ConfirmDelete
            button={<Button type="link" danger icon={<Trash2 size={18} />} />}
            itemName={record.name}
            url={`/categories/${record.id}`}
            onDeleted={handleModalSuccess}
          />
        </Flex>
      ),
    },
  ];

  return (
    <section className="px-4 py-8">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          <div className="mb-6">
            <Typography.Title level={1}>Your Categories</Typography.Title>
            <Typography.Text>
              Manage your expense categories here.
            </Typography.Text>
          </div>

          <Button type="primary" size="middle" onClick={() => showModal()}>
            Add Category
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
        />

        <CategoryModal
          isOpen={isModalOpen}
          category={editingCategory}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      </div>
    </section>
  );
}
