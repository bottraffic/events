import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

/**
 * Singleton Prisma client (MySQL). In dev, reuse across HMR reloads to avoid
 * exhausting the connection pool.
 *
 * Tenant isolation: MySQL has no Row-Level Security, so every API query filters
 * by `tenantId` at the application layer (see the NestJS services).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
