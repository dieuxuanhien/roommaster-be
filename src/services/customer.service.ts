import { PrismaClient, Customer } from '@prisma/client';
import { Injectable } from 'core/decorators';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { encryptPassword } from 'utils/encryption';

export interface CreateCustomerData {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  idNumber?: string;
  address?: string;
}

export interface UpdateCustomerData {
  fullName?: string;
  email?: string;
  idNumber?: string;
  address?: string;
}

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new customer
   * @param {CreateCustomerData} customerData - Customer data
   * @returns {Promise<Customer>} Created customer
   */
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    // Check if phone already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { phone: customerData.phone }
    });

    if (existingCustomer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered');
    }

    // Hash password
    const hashedPassword = await encryptPassword(customerData.password);

    // Create customer
    const customer = await this.prisma.customer.create({
      data: {
        ...customerData,
        password: hashedPassword
      }
    });

    return customer;
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Customer>} Customer
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    }

    return customer;
  }

  /**
   * Get customer by phone
   * @param {string} phone - Customer phone
   * @returns {Promise<Customer | null>} Customer or null
   */
  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { phone }
    });
  }

  /**
   * Update customer by ID
   * @param {string} customerId - Customer ID
   * @param {UpdateCustomerData} updateData - Update data
   * @returns {Promise<Customer>} Updated customer
   */
  async updateCustomer(customerId: string, updateData: UpdateCustomerData): Promise<Customer> {
    const customer = await this.getCustomerById(customerId);

    // If email is being updated, check if it's already in use
    if (updateData.email && updateData.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          email: updateData.email,
          id: { not: customerId }
        }
      });

      if (existingCustomer) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already in use');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customerId },
      data: updateData
    });

    return updatedCustomer;
  }
}

export default CustomerService;
