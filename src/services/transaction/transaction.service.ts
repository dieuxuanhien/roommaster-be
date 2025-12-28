import { PrismaClient } from '@prisma/client';
import { Injectable } from 'core/decorators';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { ActivityService } from '../activity.service';
import { UsageServiceService } from '../usage-service.service';
import { PromotionService } from '../promotion.service';
import { CreateTransactionPayload } from './types';
import { processFullBookingPayment } from './handlers/full-booking-payment';
import { processSplitRoomPayment } from './handlers/split-room-payment';
import { processBookingServicePayment } from './handlers/booking-service-payment';
import { processGuestServicePayment } from './handlers/guest-service-payment';

/**
 * Transaction Service
 *
 * Transaction Model:
 * - Transaction: Grouping entity for booking-related payments (has bookingId)
 * - TransactionDetail: Individual payment allocations (has bookingRoomId or serviceUsageId)
 *
 * Payment Scenarios:
 * 1. Full booking payment: Creates Transaction + multiple TransactionDetails
 * 2. Split room payment: Creates Transaction + TransactionDetails for selected rooms
 * 3. Booking service payment: Creates Transaction + TransactionDetail for service
 * 4. Guest service payment: Creates TransactionDetail only (no Transaction)
 *
 * Promotion Flow:
 * 1. Build transaction details
 * 2. Validate promotions
 * 3. Calculate discounts
 * 4. Apply discounts to details
 * 5. Aggregate transaction amounts
 * 6. Persist transaction, details, and used promotions
 */
@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly activityService: ActivityService,
    private readonly usageServiceService: UsageServiceService,
    private readonly promotionService: PromotionService
  ) {}

  /**
   * Main transaction creation entry point
   * Routes to appropriate handler based on payment scenario
   */
  async createTransaction(payload: CreateTransactionPayload) {
    const { bookingId, bookingRoomIds, serviceUsageId } = payload;

    const hasBooking = !!bookingId;
    const hasRooms = bookingRoomIds && bookingRoomIds.length > 0;
    const hasService = !!serviceUsageId;

    // Scenario 4: Guest service payment (no booking, no transaction entity)
    if (hasService && !hasBooking) {
      return processGuestServicePayment(
        payload,
        this.prisma,
        this.activityService,
        this.usageServiceService
      );
    }

    // Scenario 3: Booking service payment
    if (hasService && hasBooking) {
      return processBookingServicePayment(
        payload,
        this.prisma,
        this.activityService,
        this.usageServiceService,
        this.promotionService
      );
    }

    // Scenario 2: Split room payments
    if (hasBooking && hasRooms) {
      return processSplitRoomPayment(
        payload,
        this.prisma,
        this.activityService,
        this.usageServiceService,
        this.promotionService
      );
    }

    // Scenario 1: Full booking payment
    if (hasBooking && !hasRooms && !hasService) {
      return processFullBookingPayment(
        payload,
        this.prisma,
        this.activityService,
        this.usageServiceService,
        this.promotionService
      );
    }

    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment scenario');
  }
}

export default TransactionService;
