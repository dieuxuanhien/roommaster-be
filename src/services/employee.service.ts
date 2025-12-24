import { PrismaClient, Employee } from '@prisma/client';
import { Injectable } from 'core/decorators';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';

export interface UpdateEmployeeData {
  name?: string;
}

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get employee by ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Employee>} Employee
   */
  async getEmployeeById(employeeId: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
    }

    return employee;
  }

  /**
   * Get employee by username
   * @param {string} username - Employee username
   * @returns {Promise<Employee | null>} Employee or null
   */
  async getEmployeeByUsername(username: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { username }
    });
  }

  /**
   * Update employee by ID
   * @param {string} employeeId - Employee ID
   * @param {UpdateEmployeeData} updateData - Update data
   * @returns {Promise<Employee>} Updated employee
   */
  async updateEmployee(employeeId: string, updateData: UpdateEmployeeData): Promise<Employee> {
    await this.getEmployeeById(employeeId);

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: updateData
    });

    return updatedEmployee;
  }
}

export default EmployeeService;
