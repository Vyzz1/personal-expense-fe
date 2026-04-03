import { Button, message, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useApiMutation } from "#/hooks/useApiMutation";

interface ConfirmDeleteProps {
  itemName: string;
  button?: React.ReactNode;
  onDeleted: () => void;
  url: string;
}

export default function ConfirmDelete({
  itemName,
  button,
  onDeleted,
  url,
}: ConfirmDeleteProps) {
  const renderButton = () => {
    if (button) {
      return button;
    }
    return <Button danger>Delete</Button>;
  };

  const { mutateAsync } = useApiMutation(url, "DELETE", {
    onSuccess: () => {
      onDeleted();
    },
    onError: (error: ApiErrorResponse) => {
      message.error(
        error.message || `Failed to delete ${itemName}. Please try again.`,
      );
    },
  });

  const handleDelete = async () => {
    try {
      await mutateAsync(null);
      onDeleted();
    } catch (error) {
      // Error is handled in onError
    }
  };

  return (
    <Popconfirm
      title={`Are you sure you want to delete this ${itemName}?`}
      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
      onConfirm={handleDelete}
    >
      {renderButton()}
    </Popconfirm>
  );
}
