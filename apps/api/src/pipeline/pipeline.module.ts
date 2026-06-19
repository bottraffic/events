import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async board(tenantId: string) {
    const stages = await this.prisma.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });
    const counts = await this.prisma.lead.groupBy({
      by: ['stageId'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
      _sum: { estimatedValue: true },
    });
    const byStage = new Map(counts.map((c) => [c.stageId, c]));
    return stages.map((s) => ({
      ...s,
      leadsCount: byStage.get(s.id)?._count._all ?? 0,
      totalValue: byStage.get(s.id)?._sum.estimatedValue ?? 0,
    }));
  }
}

@Controller('pipeline')
class PipelineController {
  constructor(private pipeline: PipelineService) {}

  @Get()
  board(@CurrentUser() user: AuthUser) {
    return this.pipeline.board(user.tenantId);
  }
}

@Module({
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
