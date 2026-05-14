import type { BudgetStatus } from "#/models/buget";

export const budgetSortFieldOptions = [
  { label: "Created At", value: "createdAt" },
  { label: "Limit Amount", value: "limitAmount" },
  { label: "Name", value: "name" },
  { label: "Threshold", value: "thresholdPercentage" },
];

export const budgetSortDirectionOptions = [
  { label: "Asc", value: "asc" as const },
  { label: "Desc", value: "desc" as const },
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
