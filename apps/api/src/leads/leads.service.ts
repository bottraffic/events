import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateActivityDto,
  CreateLeadDto,
  MoveStageDto,
  ReminderDto,
  UpdateLeadDto,
} from './dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string, filters: { stageId?: string; source?: string; assignedToId?: string }) {
    return this.prisma.lead.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(filters.stageId ? { stageId: filters.stageId } : {}),
        ...(filters.source ? { source: filters.source as any } : {}),
        ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
      },
      include: { stage: true, assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        stage: true,
        assignedTo: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        reminders: { where: { status: 'pending' }, orderBy: { dueAt: 'asc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(tenantId: string, dto: CreateLeadDto) {
    let stageId = dto.stageId;
    if (!stageId) {
      const first = await this.prisma.pipelineStage.findFirst({
        where: { tenantId },
        orderBy: { order: 'asc' },
      });
      stageId = first?.id;
    }
    return this.prisma.lead.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        source: (dto.source as any) ?? 'OTHER',
        stageId,
        notes: dto.notes,
        estimatedValue: dto.estimatedValue,
        assignedToId: dto.assignedToId,
        campaignId: dto.campaignId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateLeadDto) {
    await this.assertExists(tenantId, id);
    return this.prisma.lead.update({
      where: { id },
      data: { ...dto, source: dto.source as any },
    });
  }

  async moveStage(tenantId: string, id: string, dto: MoveStageDto, userId: string) {
    const lead = await this.assertExists(tenantId, id);
    const updated = await this.prisma.lead.update({
      where: { id },
      data: { stageId: dto.stageId },
    });
    await this.prisma.leadActivity.create({
      data: {
        tenantId,
        leadId: id,
        type: 'STAGE_CHANGE',
        userId,
        payload: { from: lead.stageId, to: dto.stageId },
      },
    });
    return updated;
  }

  async addActivity(tenantId: string, id: string, dto: CreateActivityDto, userId: string) {
    await this.assertExists(tenantId, id);
    return this.prisma.leadActivity.create({
      data: {
        tenantId,
        leadId: id,
        type: dto.type as any,
        userId,
        payload: { body: dto.body },
      },
    });
  }

  async addReminder(tenantId: string, id: string, dto: ReminderDto) {
    await this.assertExists(tenantId, id);
    const dueAt = new Date();
    if (dto.when === '1h') dueAt.setHours(dueAt.getHours() + 1);
    if (dto.when === 'tomorrow') dueAt.setDate(dueAt.getDate() + 1);
    if (dto.when === 'next_week') dueAt.setDate(dueAt.getDate() + 7);
    return this.prisma.reminder.create({
      data: { tenantId, entityType: 'lead', entityId: id, leadId: id, dueAt, message: dto.message, channel: 'push' },
    });
  }

  async convert(tenantId: string, id: string) {
    const lead = await this.assertExists(tenantId, id);
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          tenantId,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          sourceLeadId: lead.id,
        },
      });
      await tx.lead.update({ where: { id }, data: { customerId: customer.id } });
      return customer;
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertExists(tenantId, id);
    await this.prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  private async assertExists(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
}
