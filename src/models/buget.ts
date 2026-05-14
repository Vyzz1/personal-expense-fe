import type { Category } from "./category";

export type BudgetStatus = "ACTIVE" | "EXPIRED" | "EXCEEDED";

export interface Budget {
  id: string;
  name: string;
  limitAmount: number;
  thresholdPercentage?: number;
  spentAmount: number;
  period: string; // e.g., "2024-06" for June 2024
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category; // if not null, it means this budget is for a specific category, otherwise it's a general budget
}

export interface BudgetsApiResponse extends ApiPaginationResponse<Budget> {}

export interface BudgetFormData {
  name: string;
  categoryId?: string;
  limitAmount: number;
  thresholdPercentage?: number;
}
