import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async overview(tenantId: string) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [leadsThisMonth, wonStage, totalLeads, upcomingEvents] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: monthStart } } }),
      this.prisma.pipelineStage.findFirst({ where: { tenantId, type: 'WON' } }),
      this.prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.event.count({ where: { tenantId, deletedAt: null, eventDate: { gte: new Date() } } }),
    ]);

    const closed = wonStage
      ? await this.prisma.lead.count({ where: { tenantId, deletedAt: null, stageId: wonStage.id } })
      : 0;

    const expectedRevenue = await this.prisma.event.aggregate({
      where: { tenantId, deletedAt: null, status: { in: ['BOOKED', 'COMPLETED'] } },
      _sum: { totalPrice: true },
    });

    return {
      leadsThisMonth,
      closedDeals: closed,
      totalLeads,
      upcomingEvents,
      expectedRevenue: expectedRevenue._sum.totalPrice ?? 0,
      conversionRate: totalLeads ? Math.round((closed / totalLeads) * 100) : 0,
    };
  }

  async sources(tenantId: string) {
    const grouped = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    });
    return grouped.map((g) => ({ source: g.source, count: g._count._all }));
  }
}

@Controller('reports')
class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser) {
    return this.reports.overview(user.tenantId);
  }

  @Get('sources')
  sources(@CurrentUser() user: AuthUser) {
    return this.reports.sources(user.tenantId);
  }
}

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
