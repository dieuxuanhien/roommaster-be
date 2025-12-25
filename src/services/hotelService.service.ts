import { PrismaClient, Service, Prisma } from '@prisma/client';
import { Injectable } from 'core/decorators';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';

export interface CreateHotelServiceData {
  name: string;
  price: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateHotelServiceData {
  name?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
}

export interface HotelServiceFilters {
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class HotelServiceService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new hotel service
   * @param {CreateHotelServiceData} serviceData - Service data
   * @returns {Promise<Service>} Created service
   */
  async createHotelService(serviceData: CreateHotelServiceData): Promise<Service> {
    // Check if service with same name already exists
    const existingService = await this.prisma.service.findFirst({
      where: { name: serviceData.name }
    });

    if (existingService) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service with this name already exists');
    }

    const service = await this.prisma.service.create({
      data: {
        name: serviceData.name,
        price: serviceData.price,
        unit: serviceData.unit || 'lần',
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      }
    });

    return service;
  }

  /**
   * Get all hotel services with filters and pagination
   * @param {HotelServiceFilters} filters - Filter options
   * @param {PaginationOptions} options - Pagination options
   * @returns {Promise<{ data: Service[]; total: number; page: number; limit: number }>}
   */
  async getAllHotelServices(
    filters: HotelServiceFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ data: Service[]; total: number; page: number; limit: number }> {
    const { search, isActive, minPrice, maxPrice } = filters;
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;

    const where: Prisma.ServiceWhereInput = {};

    // Apply search filter
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Apply isActive filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Apply price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              serviceUsages: true
            }
          }
        }
      }),
      this.prisma.service.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  /**
   * Get hotel service by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise<Service>} Service
   */
  async getHotelServiceById(serviceId: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            serviceUsages: true
          }
        }
      }
    });

    if (!service) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }

    return service;
  }

  /**
   * Update hotel service by ID
   * @param {string} serviceId - Service ID
   * @param {UpdateHotelServiceData} updateData - Update data
   * @returns {Promise<Service>} Updated service
   */
  async updateHotelService(
    serviceId: string,
    updateData: UpdateHotelServiceData
  ): Promise<Service> {
    await this.getHotelServiceById(serviceId);

    // Check if updating name to an existing name
    if (updateData.name) {
      const existingService = await this.prisma.service.findFirst({
        where: {
          name: updateData.name,
          id: { not: serviceId }
        }
      });

      if (existingService) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Service with this name already exists');
      }
    }

    const updatedService = await this.prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });

    return updatedService;
  }

  /**
   * Delete hotel service by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise<void>}
   */
  async deleteHotelService(serviceId: string): Promise<void> {
    await this.getHotelServiceById(serviceId);

    // Check if service has associated service usages
    const usageCount = await this.prisma.serviceUsage.count({
      where: { serviceId }
    });

    if (usageCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot delete service with existing usage records. Please deactivate the service instead.'
      );
    }

    await this.prisma.service.delete({
      where: { id: serviceId }
    });
  }
}

export default HotelServiceService;
