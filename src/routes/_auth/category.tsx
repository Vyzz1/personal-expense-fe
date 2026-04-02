import { useApiQuery } from "#/hooks/useApiQuery";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/category")({
  component: RouteComponent,
});
export interface Category {
  id: string;
  name: string;
  userId: string;
  parent: any;
  createdAt: string;
  updatedAt: string;
}

function RouteComponent() {
  const { data, isLoading, error } = useApiQuery<ApiResponse<Category[]>>(
    ["categories"],
    "/categories",
    {
      enabled: true,
    },
  );

  return (
    <div>
      <h1>Categories</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.data.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
