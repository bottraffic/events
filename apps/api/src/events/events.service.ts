import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface EventInput {
  customerId?: string;
  type?: string;
  eventDate?: string;
  startTime?: string;
  hallId?: string;
  guestsCount?: number;
  status?: string;
  totalPrice?: number;
  depositPaid?: number;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string, filters: { status?: string; from?: string; to?: string }) {
    return this.prisma.event.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.from || filters.to
          ? {
              eventDate: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
              },
            }
          : {}),
      },
      include: {
        customer: { select: { id: true, name: true, partnerName: true, phone: true } },
        hall: { select: { id: true, name: true } },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        hall: true,
        checklistItems: { orderBy: { createdAt: 'asc' } },
        contracts: true,
        _count: { select: { guests: true, invitations: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  create(tenantId: string, dto: EventInput) {
    return this.prisma.event.create({
      data: {
        tenantId,
        customerId: dto.customerId!,
        type: dto.type ?? 'wedding',
        eventDate: new Date(dto.eventDate!),
        startTime: dto.startTime,
        hallId: dto.hallId,
        guestsCount: dto.guestsCount ?? 0,
        status: (dto.status as any) ?? 'INQUIRY',
        totalPrice: dto.totalPrice,
        depositPaid: dto.depositPaid,
      },
    });
  }

  async update(tenantId: string, id: string, dto: EventInput) {
    await this.assertExists(tenantId, id);
    const { eventDate, status, ...rest } = dto;
    return this.prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
        ...(status ? { status: status as any } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertExists(tenantId, id);
    await this.prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  private async assertExists(tenantId: string, id: string) {
    const e = await this.prisma.event.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!e) throw new NotFoundException('Event not found');
    return e;
  }
}
