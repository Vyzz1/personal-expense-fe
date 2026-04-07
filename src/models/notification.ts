export enum InAppNotificationEventTypes {
  TRANSACTION_BATCH_PROCESSED = "TRANSACTION_BATCH_PROCESSED",
  EXPENSE_CALCULATED = "EXPENSE_CALCULATED",
  BUDGET_UPDATED = "BUDGET_UPDATED",
}


export interface InAppNotification {
  id: string;
  eventType: InAppNotificationEventTypes;
  message: string;
  description?: string;
  timestamp: string;
}