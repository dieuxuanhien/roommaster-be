import { PrismaClient } from '@prisma/client';
import { Injectable } from 'core/decorators';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaClient) {}
}

export default TokenService;
