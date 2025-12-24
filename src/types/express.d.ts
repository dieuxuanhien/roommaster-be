import { Customer, Employee } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      customer?: Omit<Customer, 'password'>;
      employee?: Omit<Employee, 'password'>;
    }
  }
}

export {};
