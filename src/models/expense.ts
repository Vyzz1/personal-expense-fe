export interface MonthlyExpense {
  totalAmount: number;
  previousTotalAmount: number;
  changePercentage: number;
  lastCalculatedAt: Date;
  month: number;
  year: number;
}

export interface MonthlyExpenseApiResponse extends ApiResponse<MonthlyExpense> {}

export interface ThreeMonthExpenseApiResponse extends ApiResponse<
  MonthlyExpense[]
> {}
