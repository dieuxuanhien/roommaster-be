/**
 * Application Module Bootstrap
 * Registers all services and controllers in the DI container
 */

import { container, TOKENS } from './container';
import prisma from 'prisma';

/**
 * Bootstrap the application by registering all dependencies
 */
export function bootstrap(): void {
  // Register PrismaClient
  container.registerValue(TOKENS.PrismaClient, prisma);
}

export default bootstrap;
