import {
  PrismaClient,
  BookingStatus,
  RoomStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod
} from '@prisma/client';
import { Injectable } from 'core/decorators';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import dayjs from 'dayjs';

export interface RoomRequest {
  roomTypeId: string;
  count: number;
}

export interface CreateBookingInput {
  rooms: RoomRequest[];
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  customerId: string;
}

export interface CheckInInput {
  bookingId: string;
  bookingRoomId: string;
  guests: Array<{
    customerId: string;
    isPrimary: boolean;
  }>;
  employeeId: string;
}
export interface CreateTransactionInput {
  bookingId: string;
  transactionType: TransactionType;
  amount: number;
  method: PaymentMethod;
  bookingRoomId?: string; // Optional, for room-specific charges
  transactionRef?: string;
  description?: string;
  employeeId: string;
}

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a booking with automatic room allocation
   * Allocates available rooms based on room type and count
   */
  async createBooking(input: CreateBookingInput) {
    const { rooms, checkInDate, checkOutDate, totalGuests, customerId } = input;

    // Calculate number of nights using dayjs
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(checkOutDate);
    const nights = checkOut.diff(checkIn, 'day');

    if (nights <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Check-out date must be after check-in date');
    }

    // Validate all room types exist
    const roomTypeIds = rooms.map((r) => r.roomTypeId);
    const roomTypes = await this.prisma.roomType.findMany({
      where: {
        id: { in: roomTypeIds }
      }
    });

    if (roomTypes.length !== roomTypeIds.length) {
      throw new ApiError(httpStatus.NOT_FOUND, 'One or more room types not found');
    }

    // Create a map for quick lookup
    const roomTypeMap = new Map(roomTypes.map((rt) => [rt.id, rt]));

    // Find available rooms for each room type
    const allocatedRooms: Array<{
      room: any;
      roomType: any;
    }> = [];

    for (const roomRequest of rooms) {
      const roomType = roomTypeMap.get(roomRequest.roomTypeId);
      if (!roomType) continue;

      // Find available rooms of this type
      const availableRooms = await this.prisma.room.findMany({
        where: {
          roomTypeId: roomRequest.roomTypeId,
          status: RoomStatus.AVAILABLE,
          // Exclude rooms with overlapping bookings
          bookingRooms: {
            none: {
              AND: [
                { checkInDate: { lte: checkOut.toDate() } },
                { checkOutDate: { gte: checkIn.toDate() } },
                {
                  status: {
                    in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]
                  }
                }
              ]
            }
          }
        },
        take: roomRequest.count,
        include: {
          roomType: true
        }
      });

      if (availableRooms.length < roomRequest.count) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `Not enough available rooms for room type: ${roomType.name}. Requested: ${roomRequest.count}, Available: ${availableRooms.length}`
        );
      }

      allocatedRooms.push(
        ...availableRooms.map((room) => ({
          room,
          roomType: room.roomType
        }))
      );
    }

    // Generate unique booking code
    const bookingCode = `BK${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Calculate expiration time (15 minutes from now) using dayjs
    const expiresAt = dayjs().add(15, 'minute').toDate();

    // Calculate total amount and deposit required
    let totalAmount = 0;
    let depositRequired = 0;
    const bookingRoomsData = allocatedRooms.map(({ room, roomType }) => {
      const subtotal = Number(roomType.pricePerNight) * nights;
      totalAmount += subtotal;
      depositRequired += Number(roomType.pricePerNight); // One night's price per room

      return {
        roomId: room.id,
        roomTypeId: roomType.id,
        checkInDate: checkIn.toDate(),
        checkOutDate: checkOut.toDate(),
        pricePerNight: roomType.pricePerNight,
        subtotalRoom: subtotal,
        totalAmount: subtotal,
        balance: subtotal,
        status: BookingStatus.PENDING
      };
    });

    // Create booking with transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          bookingCode,
          status: BookingStatus.PENDING,
          primaryCustomerId: customerId,
          checkInDate: checkIn.toDate(),
          checkOutDate: checkOut.toDate(),
          totalGuests,
          totalAmount,
          depositRequired,
          balance: totalAmount,
          bookingRooms: {
            create: bookingRoomsData
          }
        },
        include: {
          bookingRooms: {
            include: {
              room: true,
              roomType: true
            }
          },
          primaryCustomer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true
            }
          }
        }
      });

      // Update room statuses to RESERVED
      await tx.room.updateMany({
        where: {
          id: { in: allocatedRooms.map((ar) => ar.room.id) }
        },
        data: {
          status: RoomStatus.RESERVED
        }
      });

      return newBooking;
    });

    return {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      expiresAt,
      totalAmount: booking.totalAmount,
      booking
    };
  }

  /**
   * Check in guests for a confirmed booking
   * Updates room status to OCCUPIED and records check-in time
   */
  async checkIn(input: CheckInInput) {
    const { bookingId, bookingRoomId, guests, employeeId } = input;

    // Verify booking exists and is CONFIRMED
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingRooms: {
          include: {
            room: true
          }
        }
      }
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot check in. Booking status must be CONFIRMED, current status: ${booking.status}`
      );
    }

    // Verify booking room exists
    const bookingRoom = booking.bookingRooms.find((br) => br.id === bookingRoomId);
    if (!bookingRoom) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking room not found');
    }

    // Verify at least one guest is marked as primary
    const hasPrimary = guests.some((g) => g.isPrimary);
    if (!hasPrimary) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'At least one guest must be designated as primary'
      );
    }

    // Verify all customers exist
    const customerIds = guests.map((g) => g.customerId);
    const customers = await this.prisma.customer.findMany({
      where: {
        id: { in: customerIds }
      }
    });

    if (customers.length !== customerIds.length) {
      throw new ApiError(httpStatus.NOT_FOUND, 'One or more customers not found');
    }

    const now = new Date();

    // Perform check-in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update booking room with actual check-in time
      const updatedBookingRoom = await tx.bookingRoom.update({
        where: { id: bookingRoomId },
        data: {
          actualCheckIn: now,
          status: BookingStatus.CHECKED_IN
        }
      });

      // Update room status to OCCUPIED
      await tx.room.update({
        where: { id: bookingRoom.roomId },
        data: {
          status: RoomStatus.OCCUPIED
        }
      });

      // Update booking status to CHECKED_IN
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CHECKED_IN
        },
        include: {
          bookingRooms: {
            include: {
              room: true,
              roomType: true
            }
          },
          primaryCustomer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true
            }
          }
        }
      });

      // Link guests to the booking room
      const bookingCustomersData = guests.map((guest) => ({
        bookingId,
        customerId: guest.customerId,
        bookingRoomId,
        isPrimary: guest.isPrimary
      }));

      await tx.bookingCustomer.createMany({
        data: bookingCustomersData,
        skipDuplicates: true
      });

      // Create audit trail entry
      await tx.bookingHistory.create({
        data: {
          bookingId,
          employeeId,
          action: 'CHECK_IN',
          changes: {
            bookingRoomId,
            actualCheckIn: now.toISOString(),
            roomStatus: RoomStatus.OCCUPIED,
            guests: guests.map((g) => ({
              customerId: g.customerId,
              isPrimary: g.isPrimary
            }))
          }
        }
      });

      return {
        booking: updatedBooking,
        bookingRoom: updatedBookingRoom
      };
    });

    return result;
  }

  /**
   * Get booking by ID with full details
   */
  async getBookingById(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingRooms: {
          include: {
            room: true,
            roomType: true,
            bookingCustomers: {
              include: {
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        primaryCustomer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        histories: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    return booking;
  }

  /**
   * Create a transaction for a booking
   * Handles different transaction types with specific business logic
   */
  async createTransaction(input: CreateTransactionInput) {
    const {
      bookingId,
      transactionType,
      amount,
      method,
      bookingRoomId,
      transactionRef,
      description,
      employeeId
    } = input;

    // Verify booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingRooms: true,
        transactions: {
          where: {
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED
          }
        }
      }
    });

    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Validate based on transaction type
    await this.validateTransaction(booking, transactionType, amount);

    // Create transaction with type-specific logic
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          bookingId,
          bookingRoomId,
          type: transactionType,
          amount,
          method,
          status: TransactionStatus.COMPLETED,
          processedById: employeeId,
          transactionRef,
          description:
            description || this.getDefaultDescription(transactionType, booking.bookingCode),
          occurredAt: new Date()
        }
      });

      // Apply type-specific business logic
      const updatedBooking = await this.applyTransactionLogic(
        tx,
        booking,
        transaction,
        transactionType,
        amount
      );

      return {
        transaction,
        booking: updatedBooking
      };
    });

    return result;
  }

  /**
   * Validate transaction based on type
   */
  private async validateTransaction(
    booking: any,
    transactionType: TransactionType,
    amount: number
  ) {
    switch (transactionType) {
      case TransactionType.DEPOSIT:
        // Can only deposit for PENDING bookings
        if (booking.status !== BookingStatus.PENDING) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot create deposit for booking with status: ${booking.status}. Only PENDING bookings can receive deposits.`
          );
        }
        // Validate deposit amount
        if (amount > Number(booking.totalAmount)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Deposit amount (${amount}) cannot exceed total booking amount (${booking.totalAmount})`
          );
        }
        // Check total deposits don't exceed booking amount
        const totalDeposits = booking.transactions.reduce(
          (sum: number, txn: any) => sum + Number(txn.amount),
          0
        );
        if (totalDeposits + amount > Number(booking.totalAmount)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Total deposits (${totalDeposits + amount}) would exceed booking amount (${
              booking.totalAmount
            })`
          );
        }
        break;

      case TransactionType.ROOM_CHARGE:
      case TransactionType.SERVICE_CHARGE:
        // Can only charge for CONFIRMED or CHECKED_IN bookings
        if (![BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(booking.status)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot create charges for booking with status: ${booking.status}`
          );
        }
        // Validate amount is positive
        if (amount <= 0) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Charge amount must be positive');
        }
        break;

      case TransactionType.REFUND:
        // Can only refund if there's paid amount
        if (Number(booking.totalPaid) <= 0) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'No payments to refund');
        }
        // Refund amount cannot exceed total paid
        if (amount > Number(booking.totalPaid)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Refund amount (${amount}) cannot exceed total paid (${booking.totalPaid})`
          );
        }
        break;

      case TransactionType.ADJUSTMENT:
        // Adjustments can be positive or negative
        // No specific validation needed
        break;

      default:
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Unsupported transaction type: ${transactionType}`
        );
    }
  }

  /**
   * Apply transaction logic based on type
   */
  private async applyTransactionLogic(
    tx: any,
    booking: any,
    transaction: any,
    transactionType: TransactionType,
    amount: number
  ) {
    let newTotalDeposit = Number(booking.totalDeposit);
    let newTotalPaid = Number(booking.totalPaid);
    let newTotalAmount = Number(booking.totalAmount);
    let newBalance = Number(booking.balance);
    let newStatus = booking.status;

    switch (transactionType) {
      case TransactionType.DEPOSIT:
        // Increase deposit and paid amounts
        newTotalDeposit += amount;
        newTotalPaid += amount;
        newBalance = newTotalAmount - newTotalPaid;

        // Check if deposit is sufficient to confirm booking
        const minimumDepositRequired = Number(booking.depositRequired);
        if (newTotalDeposit >= minimumDepositRequired && booking.status === BookingStatus.PENDING) {
          newStatus = BookingStatus.CONFIRMED;

          // Update booking rooms status to CONFIRMED
          await tx.bookingRoom.updateMany({
            where: {
              bookingId: booking.id,
              status: BookingStatus.PENDING
            },
            data: {
              status: BookingStatus.CONFIRMED,
              depositAmount: amount / booking.bookingRooms.length
            }
          });
        }
        break;

      case TransactionType.ROOM_CHARGE:
      case TransactionType.SERVICE_CHARGE:
        // Increase total amount and balance (additional charges)
        newTotalAmount += amount;
        newBalance += amount;
        break;

      case TransactionType.REFUND:
        // Decrease paid amount and adjust balance
        newTotalPaid -= amount;
        newBalance = newTotalAmount - newTotalPaid;
        // If refunding deposit, decrease deposit amount
        if (newTotalDeposit > 0) {
          newTotalDeposit = Math.max(0, newTotalDeposit - amount);
        }
        break;

      case TransactionType.ADJUSTMENT:
        // Adjustments can increase or decrease balance
        // Positive = increase balance (credit to customer)
        // Negative = decrease balance (debit from customer)
        newBalance += amount;
        newTotalAmount += amount;
        break;
    }

    // Update booking with new totals
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        totalDeposit: newTotalDeposit,
        totalPaid: newTotalPaid,
        totalAmount: newTotalAmount,
        balance: newBalance,
        status: newStatus
      },
      include: {
        bookingRooms: {
          include: {
            room: true,
            roomType: true
          }
        },
        primaryCustomer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return updatedBooking;
  }

  /**
   * Get default description for transaction type
   */
  private getDefaultDescription(transactionType: TransactionType, bookingCode: string): string {
    switch (transactionType) {
      case TransactionType.DEPOSIT:
        return `Deposit for booking ${bookingCode}`;
      case TransactionType.ROOM_CHARGE:
        return `Room charge for booking ${bookingCode}`;
      case TransactionType.SERVICE_CHARGE:
        return `Service charge for booking ${bookingCode}`;
      case TransactionType.REFUND:
        return `Refund for booking ${bookingCode}`;
      case TransactionType.ADJUSTMENT:
        return `Adjustment for booking ${bookingCode}`;
      default:
        return `Transaction for booking ${bookingCode}`;
    }
  }
}

export default BookingService;
