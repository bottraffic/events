import {
  Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Query,
} from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

/* ===================== USERS (team) ===================== */
@Injectable()
class UsersService {
  constructor(private p: PrismaService) {}
  list(t: string) {
    return this.p.user.findMany({
      where: { tenantId: t, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true, status: true, lastLoginAt: true, userRoles: { include: { role: { select: { name: true, level: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
@Controller('users')
class UsersController {
  constructor(private s: UsersService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }
}

/* ===================== TRACKING NUMBERS ===================== */
class TnDto {
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() campaignId?: string;
}
@Injectable()
class TrackingService {
  constructor(private p: PrismaService) {}
  list(t: string) { return this.p.trackingNumber.findMany({ where: { tenantId: t }, include: { campaign: { select: { id: true, name: true } }, _count: { select: { calls: true } } } }); }
  create(t: string, d: TnDto) { return this.p.trackingNumber.create({ data: { tenantId: t, phoneNumber: d.phoneNumber ?? '', provider: d.provider ?? 'twilio', status: d.status ?? 'active', campaignId: d.campaignId } }); }
  async remove(t: string, id: string) { const x = await this.p.trackingNumber.findFirst({ where: { id, tenantId: t } }); if (!x) throw new NotFoundException(); await this.p.trackingNumber.delete({ where: { id } }); return { deleted: true }; }
}
@Controller('tracking-numbers')
class TrackingController {
  constructor(private s: TrackingService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: TnDto) { return this.s.create(u.tenantId, d); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

/* ===================== REPORTS EXTRA (funnel + revenue) ===================== */
@Injectable()
class ReportsExtraService {
  constructor(private p: PrismaService) {}
  async funnel(t: string) {
    const stages = await this.p.pipelineStage.findMany({ where: { tenantId: t }, orderBy: { order: 'asc' } });
    const counts = await this.p.lead.groupBy({ by: ['stageId'], where: { tenantId: t, deletedAt: null }, _count: { _all: true } });
    const map = new Map(counts.map((c) => [c.stageId, c._count._all]));
    return stages.map((s) => ({ stage: s.name, color: s.color, count: map.get(s.id) ?? 0 }));
  }
  async revenue(t: string) {
    const events = await this.p.event.findMany({
      where: { tenantId: t, deletedAt: null, status: { in: ['BOOKED', 'COMPLETED'] as any } },
      select: { eventDate: true, totalPrice: true },
    });
    const byMonth: Record<string, number> = {};
    for (const e of events) {
      const key = e.eventDate.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + Number(e.totalPrice ?? 0);
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  }
}
@Controller('reports')
class ReportsExtraController {
  constructor(private s: ReportsExtraService) {}
  @Get('funnel') funnel(@CurrentUser() u: AuthUser) { return this.s.funnel(u.tenantId); }
  @Get('revenue') revenue(@CurrentUser() u: AuthUser) { return this.s.revenue(u.tenantId); }
}

/* ===================== ALIASES (paths the web expects) ===================== */
@Controller('guests')
class GuestsAliasController {
  constructor(private p: PrismaService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('eventId') eventId?: string) {
    return this.p.eventGuest.findMany({ where: { tenantId: u.tenantId, ...(eventId ? { eventId } : {}) }, orderBy: { createdAt: 'desc' } });
  }
}
@Controller('seating-plans')
class SeatingPlansAliasController {
  constructor(private p: PrismaService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('eventId') eventId?: string) {
    return this.p.seatingChart.findMany({ where: { tenantId: u.tenantId, ...(eventId ? { eventId } : {}) } });
  }
}

@Module({
  controllers: [UsersController, TrackingController, ReportsExtraController, GuestsAliasController, SeatingPlansAliasController],
  providers: [UsersService, TrackingService, ReportsExtraService],
})
export class CompatModule {}
