import { Body, Controller, ForbiddenException, Get, Injectable, Module, Post, Query, Req } from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators';

class ReportDto {
  @IsString() @IsNotEmpty() type!: string; // crash | error | event
  @IsOptional() @IsString() platform?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsString() stack?: string;
  @IsOptional() @IsString() appVersion?: string;
  @IsOptional() @IsString() deviceId?: string;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() url?: string;
}

@Injectable()
export class TelemetryService {
  constructor(private p: PrismaService) {}

  record(d: ReportDto) {
    return this.p.telemetryEvent.create({
      data: {
        type: d.type, platform: d.platform, message: d.message?.slice(0, 4000),
        stack: d.stack?.slice(0, 8000), appVersion: d.appVersion, deviceId: d.deviceId,
        tenantId: d.tenantId, userId: d.userId, url: d.url,
      },
    });
  }

  async list(type?: string) {
    const where = type && type !== 'all' ? { type } : {};
    const [events, crashes, errors, devices] = await Promise.all([
      this.p.telemetryEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }),
      this.p.telemetryEvent.count({ where: { type: 'crash' } }),
      this.p.telemetryEvent.count({ where: { type: 'error' } }),
      this.p.telemetryEvent.findMany({ where: { type: { in: ['crash', 'error'] } }, select: { deviceId: true }, distinct: ['deviceId'] }),
    ]);
    return { events, stats: { crashes, errors, affectedDevices: devices.filter((d) => d.deviceId).length } };
  }
}

@Controller('telemetry')
class TelemetryController {
  constructor(private s: TelemetryService) {}

  /** Clients report crashes/errors/events here (no auth — crashes may occur pre-login). */
  @Public()
  @Post()
  report(@Body() dto: ReportDto) { return this.s.record(dto); }

  /** Operator-only: view crash/error feed + stats. */
  @Public()
  @Get()
  list(@Req() req: any, @Query('type') type?: string) {
    const key = req.headers['x-platform-key'];
    if (!key || key !== (process.env.PLATFORM_KEY ?? process.env.JWT_SECRET)) throw new ForbiddenException('forbidden');
    return this.s.list(type);
  }
}

@Module({ controllers: [TelemetryController], providers: [TelemetryService] })
export class TelemetryModule {}
