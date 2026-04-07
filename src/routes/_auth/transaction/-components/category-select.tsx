import { useApiQuery } from "#/hooks/useApiQuery";
import type { Category } from "#/models/category";
import { Select } from "antd";

interface CategorySelectProps {
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export default function CategorySelect({
  defaultValue,
  onChange,
}: CategorySelectProps) {
  const { data: categoriesData, isLoading: isLoadingCategories } = useApiQuery<
    ApiResponse<Category[]>
  >(["categories"], "/categories", {});

  const options =
    categoriesData?.data?.map((c) => ({
      label: c.name,
      value: c.id,
    })) || [];

  return (
    <Select
      defaultValue={defaultValue}
      onChange={onChange}
      mode="multiple"
      allowClear
      style={{
        width: 250,
      }}
      placeholder="Select categories"
      loading={isLoadingCategories}
      options={options}
    />
  );
}
