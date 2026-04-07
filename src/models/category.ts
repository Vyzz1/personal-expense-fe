export interface Category {
  id: string;
  name: string;
  userId: string;
  parentId: string;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAnalytics {
  month: number;
  year: number;
  totalAmount: number;
  transactionCount: number;
  id: string;
  name: string;
}

export interface CategoryAnalyticsApiResponse extends ApiResponse<
  CategoryAnalytics[]
> {}
