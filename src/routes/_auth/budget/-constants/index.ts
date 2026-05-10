import type { BudgetStatus } from "#/models/buget";

export const budgetSortOptions = [
  {
    label: "Created At (Newest)",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    label: "Created At (Oldest)",
    sortBy: "createdAt",
    sortOrder: "asc",
  },
  {
    label: "Limit Amount (Lowest)",
    sortBy: "limitAmount",
    sortOrder: "asc",
  },
  {
    label: "Limit Amount (Highest)",
    sortBy: "limitAmount",
    sortOrder: "desc",
  },
];
export const budgetStatusOptions: { label: string; value: BudgetStatus }[] = [
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Expired",
    value: "EXPIRED",
  },
  {
    label: "Exceeded",
    value: "EXCEEDED",
  },
];
