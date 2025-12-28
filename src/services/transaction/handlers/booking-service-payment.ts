import { PrismaClient, Prisma, TransactionStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { ActivityService } from '../../activity.service';
import { UsageServiceService } from '../../usage-service.service';
import { PromotionService } from '../../promotion.service';
import { CreateTransactionPayload, TransactionDetailData } from '../types';
import { validatePromotions } from '../validators/promotion-validator';
import { calculateDiscounts, applyDiscountsToDetails } from '../calculators/discount-calculator';
import { aggregateTransactionAmounts } from '../calculators/amount-aggregator';
import { updateBookingTotals } from '../helpers/booking-updater';

/**
 * Scenario 3: Booking service payment
 * Creates Transaction (with bookingId) + TransactionDetail for service
 */
export async function processBookingServicePayment(
  payload: CreateTransactionPayload,
  prisma: PrismaClient,
  activityService: ActivityService,
  usageServiceService: UsageServiceService,
  promotionService: PromotionService
) {
  const {
    bookingId,
    serviceUsageId,
    paymentMethod,
    transactionType,
    transactionRef,
    description,
    employeeId,
    promotionApplications = []
  } = payload;

  if (!bookingId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking ID is required');
  }

  if (!serviceUsageId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service usage ID is required');
  }

  return prisma.$transaction(async (tx) => {
    // STEP 1: Fetch service usage and validate
    const serviceUsage = await tx.serviceUsage.findUnique({
      where: { id: serviceUsageId },
      include: {
        service: true,
        bookingRoom: {
          include: {
            booking: true
          }
        }
      }
    });

    if (!serviceUsage) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Service usage not found');
    }

    if (serviceUsage.bookingRoom?.bookingId !== bookingId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service does not belong to this booking');
    }

    // STEP 2: Build transaction detail for service
    const serviceBalance = new Prisma.Decimal(serviceUsage.totalPrice).sub(serviceUsage.totalPaid);

    if (serviceBalance.lte(0)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service is already fully paid');
    }

    const transactionDetails: TransactionDetailData[] = [
      {
        serviceUsageId,
        baseAmount: serviceBalance.toNumber(),
        discountAmount: 0,
        amount: serviceBalance.toNumber()
      }
    ];

    // STEP 3: Validate promotions
    await validatePromotions(promotionApplications, promotionService);

    // STEP 4: Calculate discounts
    const discounts = await calculateDiscounts(
      promotionApplications,
      transactionDetails,
      promotionService,
      prisma
    );

    // STEP 5: Apply discounts to details
    const detailsWithDiscounts = applyDiscountsToDetails(transactionDetails, discounts);

    // STEP 6: Aggregate transaction amounts
    const transactionAmounts = aggregateTransactionAmounts(detailsWithDiscounts, discounts);

    // STEP 7: Create transaction
    const transaction = await tx.transaction.create({
      data: {
        bookingId,
        type: transactionType,
        baseAmount: transactionAmounts.baseAmount,
        discountAmount: transactionAmounts.discountAmount,
        amount: transactionAmounts.amount,
        method: paymentMethod,
        status: TransactionStatus.COMPLETED,
        processedById: employeeId,
        transactionRef,
        description: description || `${transactionType} for ${serviceUsage.service.name}`
      }
    });

    // STEP 8: Create transaction detail
    const detail = detailsWithDiscounts[0];
    const createdDetail = await tx.transactionDetail.create({
      data: {
        transactionId: transaction.id,
        serviceUsageId,
        baseAmount: detail.baseAmount,
        discountAmount: detail.discountAmount,
        amount: detail.amount
      }
    });

    // Update service payment
    await usageServiceService.updateServiceUsagePayment(
      serviceUsageId,
      detail.amount,
      employeeId,
      tx
    );

    // STEP 9: Create UsedPromotion records
    for (const app of promotionApplications) {
      const discountInfo = discounts.get(app.customerPromotionId);
      if (discountInfo && discountInfo.amount > 0) {
        const customerPromotion = await tx.customerPromotion.findUnique({
          where: { id: app.customerPromotionId }
        });

        if (!customerPromotion) {
          continue;
        }

        await tx.usedPromotion.create({
          data: {
            promotionId: customerPromotion.promotionId,
            discountAmount: discountInfo.amount,
            transactionDetailId: createdDetail.id,
            transactionId: transaction.id
          }
        });

        await tx.customerPromotion.update({
          where: { id: app.customerPromotionId },
          data: {
            status: 'USED',
            usedAt: new Date(),
            transactionDetailId: createdDetail.id
          }
        });
      }
    }

    // Update booking totals
    await updateBookingTotals(bookingId, tx);

    // Create activity
    await activityService.createTransactionActivity(
      transaction.id,
      employeeId,
      transactionType,
      transactionAmounts.amount,
      tx
    );

    return {
      transaction: await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { details: true, usedPromotions: true }
      }),
      booking: await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          bookingRooms: { include: { room: true, roomType: true } },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { details: true }
          }
        }
      })
    };
  });
}
