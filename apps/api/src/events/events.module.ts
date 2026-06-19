import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

class CreateEventDto {
  @IsString() customerId!: string;
  @IsOptional() @IsString() type?: string;
  @IsDateString() eventDate!: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() hallId?: string;
  @IsOptional() @IsInt() @Min(0) guestsCount?: number;
  @IsOptional() @IsString() status?: string;
}

class UpdateEventDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsDateString() eventDate?: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() hallId?: string;
  @IsOptional() @IsInt() @Min(0) guestsCount?: number;
  @IsOptional() @IsString() status?: string;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  list(tenantId: string, from?: string, to?: string) {
    return this.prisma.event.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(from || to
          ? { eventDate: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
          : {}),
      },
      include: { customer: { select: { id: true, name: true, partnerName: true } }, hall: true },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        hall: true,
        guests: true,
        seatingCharts: true,
        eventVendors: { include: { vendor: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  create(tenantId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        tenantId,
        customerId: dto.customerId,
        type: dto.type ?? 'wedding',
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        hallId: dto.hallId,
        guestsCount: dto.guestsCount ?? 0,
        status: (dto.status as any) ?? 'INQUIRY',
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEventDto) {
    const exists = await this.prisma.event.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!exists) throw new NotFoundException('Event not found');
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as any,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
      },
    });
  }
}

@Controller('events')
class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    return this.events.list(user.tenantId, from, to);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.events.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.events.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(user.tenantId, id, dto);
  }
}

@Module({
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
