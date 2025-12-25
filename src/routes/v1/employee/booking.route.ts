import express from 'express';
import validate from 'middlewares/validate';
import { bookingValidation } from 'validations';
import EmployeeBookingController from 'controllers/employee/employee.booking.controller';
import { container, TOKENS } from 'core/container';
import { BookingService } from 'services/booking.service';
import { authEmployee } from 'middlewares/auth';

const router = express.Router();

// Resolve dependencies from container
const bookingService = container.resolve<BookingService>(TOKENS.BookingService);
const employeeBookingController = new EmployeeBookingController(bookingService);

/**
 * @swagger
 * tags:
 *   name: Employee Bookings
 *   description: Employee booking management endpoints
 */

/**
 * @swagger
 * /employee/bookings/check-in:
 *   patch:
 *     summary: Check in guests for a confirmed booking
 *     description: Update booking and room status to checked-in, record actual check-in time
 *     tags: [Employee Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - bookingRoomId
 *               - guests
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID
 *               bookingRoomId:
 *                 type: string
 *                 description: Booking room ID to check in
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - customerId
 *                   properties:
 *                     customerId:
 *                       type: string
 *                       description: Customer ID
 *                     isPrimary:
 *                       type: boolean
 *                       description: Whether this guest is the primary contact for the room
 *                 description: List of guests checking in
 *             example:
 *               bookingId: "booking_id_123"
 *               bookingRoomId: "booking_room_id_456"
 *               guests:
 *                 - customerId: "customer_id_1"
 *                   isPrimary: true
 *                 - customerId: "customer_id_2"
 *                   isPrimary: false
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       type: object
 *                     bookingRoom:
 *                       type: object
 *       400:
 *         description: Invalid booking status or validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/check-in',
  authEmployee,
  validate(bookingValidation.checkIn),
  employeeBookingController.checkIn
);

/**
 * @swagger
 * /employee/bookings/transaction:
 *   post:
 *     summary: Create a transaction for a booking
 *     description: Process various transaction types (deposit, charges, refunds, adjustments) with type-specific business logic
 *     tags: [Employee Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - transactionType
 *               - amount
 *               - method
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID
 *               transactionType:
 *                 type: string
 *                 enum: [DEPOSIT, ROOM_CHARGE, SERVICE_CHARGE, REFUND, ADJUSTMENT]
 *                 description: Type of transaction
 *               amount:
 *                 type: number
 *                 description: Transaction amount (can be negative for adjustments)
 *               method:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET]
 *                 description: Payment method
 *               bookingRoomId:
 *                 type: string
 *                 description: Specific booking room ID (optional, for room-specific charges)
 *               transactionRef:
 *                 type: string
 *                 description: External transaction reference (optional)
 *               description:
 *                 type: string
 *                 description: Additional notes about the transaction (optional)
 *             example:
 *               bookingId: "booking_id_123"
 *               transactionType: "DEPOSIT"
 *               amount: 500000
 *               method: "BANK_TRANSFER"
 *               transactionRef: "TXN123456"
 *               description: "Initial deposit payment"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       description: Created transaction details
 *                     booking:
 *                       type: object
 *                       description: Updated booking with new totals and status
 *       400:
 *         description: Invalid request or business rule violation
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/transaction',
  authEmployee,
  validate(bookingValidation.createTransaction),
  employeeBookingController.createTransaction
);

/**
 * @swagger
 * /employee/bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     description: Retrieve detailed information about a specific booking
 *     tags: [Employee Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authEmployee, employeeBookingController.getBooking);

export default router;
