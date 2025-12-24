import { Response } from 'express';
import httpStatus from 'http-status';

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  totalItems: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Paginated response data interface
 */
export interface PaginatedData<T> {
  items: T[];
  totalItems: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Send a successful response with data wrapped in a data object
 * @param res - Express response object
 * @param data - Data to send in response
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendData = <T>(res: Response, data: T, statusCode: number = httpStatus.OK): void => {
  res.status(statusCode).send({ data });
};

/**
 * Send a paginated response with items and pagination metadata
 * @param res - Express response object
 * @param items - Array of items
 * @param pagination - Pagination metadata
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendPaginatedData = <T>(
  res: Response,
  items: T[],
  pagination: PaginationMeta,
  statusCode: number = httpStatus.OK
): void => {
  const data: PaginatedData<T> = {
    items,
    totalItems: pagination.totalItems,
    perPage: pagination.perPage,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages
  };
  res.status(statusCode).send({ data });
};

/**
 * Send a no content response (204)
 * @param res - Express response object
 */
export const sendNoContent = (res: Response): void => {
  res.status(httpStatus.NO_CONTENT).send();
};

/**
 * Calculate pagination metadata
 * @param totalItems - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export const calculatePagination = (totalItems: number, page = 1, limit = 10): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    perPage: limit,
    currentPage: page,
    totalPages
  };
};
