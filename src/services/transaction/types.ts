export interface PromotionApplication {
  customerPromotionId: string;
  bookingRoomId?: string; // Apply to specific room detail
  serviceUsageId?: string; // Apply to specific service detail
  // If neither provided → apply to transaction level
}

export interface CreateTransactionPayload {
  // Scenario identifiers
  bookingId?: string;
  bookingRoomIds?: string[];
  serviceUsageId?: string;

  // Payment details (amount removed - will be calculated)
  paymentMethod: import('@prisma/client').PaymentMethod;
  transactionType: import('@prisma/client').TransactionType;
  transactionRef?: string;
  description?: string;
  employeeId: string;

  // Promotion support
  promotionApplications?: PromotionApplication[];
}

export interface TransactionDetailData {
  bookingRoomId?: string;
  serviceUsageId?: string;
  baseAmount: number;
  discountAmount: number;
  amount: number;
}

export interface TransactionAmounts {
  baseAmount: number;
  discountAmount: number;
  amount: number;
}

export interface DiscountInfo {
  amount: number;
  target: PromotionApplication;
}
