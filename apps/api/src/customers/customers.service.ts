import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CustomerInput {
  name?: string;
  partnerName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string, q?: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { partnerName: { contains: q } },
                { phone: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        events: { where: { deletedAt: null }, orderBy: { eventDate: 'desc' } },
        contracts: { orderBy: { createdAt: 'desc' } },
        conversations: { orderBy: { lastMessageAt: 'desc' }, take: 10 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  create(tenantId: string, dto: CustomerInput) {
    return this.prisma.customer.create({
      data: {
        tenantId,
        name: dto.name!,
        partnerName: dto.partnerName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
      },
    });
  }

  async update(tenantId: string, id: string, dto: CustomerInput) {
    await this.assertExists(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    await this.assertExists(tenantId, id);
    await this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  private async assertExists(tenantId: string, id: string) {
    const c = await this.prisma.customer.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }
}
