import express from 'express';
import validate from 'middlewares/validate';
import { transactionValidation } from 'validations';
import EmployeeTransactionController from 'controllers/employee/employee.transaction.controller';
import { container, TOKENS } from 'core/container';
import { TransactionService } from 'services/transaction';
import { authEmployee } from 'middlewares/auth';

const router = express.Router();

// Resolve dependencies from container
const transactionService = container.resolve<TransactionService>(TOKENS.TransactionService);
const employeeTransactionController = new EmployeeTransactionController(transactionService);

/**
 * @swagger
 * tags:
 *   name: Employee Transactions
 *   description: Employee transaction management endpoints
 */

/**
 * @swagger
 * /employee/transactions:
 *   post:
 *     summary: Create a transaction
 *     description: Create a transaction for booking payment (full, split room, or service) with optional promotions
 *     tags: [Employee Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - transactionType
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID (required for booking-related payments)
 *               bookingRoomIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific room IDs for split payment
 *               serviceUsageId:
 *                 type: string
 *                 description: Service usage ID for service payment
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, MOMO, ZALOPAY]
 *               transactionType:
 *                 type: string
 *                 enum: [DEPOSIT, ROOM_CHARGE, SERVICE_CHARGE, REFUND, ADJUSTMENT]
 *               transactionRef:
 *                 type: string
 *                 description: External transaction reference
 *               description:
 *                 type: string
 *                 description: Custom transaction description
 *               promotionApplications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - customerPromotionId
 *                   properties:
 *                     customerPromotionId:
 *                       type: string
 *                     bookingRoomId:
 *                       type: string
 *                       description: Apply promotion to specific room
 *                     serviceUsageId:
 *                       type: string
 *                       description: Apply promotion to specific service
 *           examples:
 *             fullBooking:
 *               summary: Full booking payment
 *               value:
 *                 bookingId: "booking_123"
 *                 paymentMethod: "CASH"
 *                 transactionType: "DEPOSIT"
 *             splitRoom:
 *               summary: Split room payment
 *               value:
 *                 bookingId: "booking_123"
 *                 bookingRoomIds: ["room_1", "room_2"]
 *                 paymentMethod: "CREDIT_CARD"
 *                 transactionType: "ROOM_CHARGE"
 *             withPromotion:
 *               summary: Payment with promotion
 *               value:
 *                 bookingId: "booking_123"
 *                 paymentMethod: "CASH"
 *                 transactionType: "DEPOSIT"
 *                 promotionApplications:
 *                   - customerPromotionId: "cp_123"
 *                     bookingRoomId: "room_1"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking or service not found
 */
router.post(
  '/',
  authEmployee,
  validate(transactionValidation.createTransaction),
  employeeTransactionController.createTransaction
);

export default router;
