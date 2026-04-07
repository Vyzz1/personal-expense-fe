import type { Category } from "./category";

export interface TransactionResponse {
  id: string;
  description: string;
  amount: number;
  category: Category;
  occurredAt: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionApiPaginationResponse extends ApiPaginationResponse<TransactionResponse> {}

export interface TransactionRequest {
  description: string;
  amount: number;
  categoryId: string;
  occurredAt: string;
  type: "INCOME" | "EXPENSE";
}
