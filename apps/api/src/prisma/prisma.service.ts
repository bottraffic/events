import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@simcha/db';

/**
 * Wraps the Prisma client as an injectable Nest provider.
 * Tenant isolation is enforced two ways:
 *   1. App layer — every service query filters by `tenantId` (see services).
 *   2. DB layer — Postgres RLS policies (prisma/rls.sql) as a backstop.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
