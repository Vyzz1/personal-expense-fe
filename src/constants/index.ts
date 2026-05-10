export interface TransactionRangeAmount {
  label: string;
  value: string;
  min?: number;
  max?: number;
}

export const TRANSACTION_RANGE_AMOUNT: TransactionRangeAmount[] = [
  { label: "Any Amount", value: "any" },
  { label: "Under $50", value: "under_50", max: 50 },
  { label: "$50 - $100", value: "50_100", min: 50, max: 100 },
  { label: "$100 - $500", value: "100_500", min: 100, max: 500 },
  { label: "Over $500", value: "over_500", min: 500 },
];