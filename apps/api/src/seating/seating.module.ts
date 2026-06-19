import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Delete, Query,
} from '@nestjs/common';
import { IsInt, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

class ChartDto {
  @IsString() @IsNotEmpty() eventId!: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() canvas?: any;
}
class TableDto {
  @IsString() @IsNotEmpty() chartId!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsNumber() x?: number;
  @IsOptional() @IsNumber() y?: number;
  @IsOptional() @IsInt() seats?: number;
  @IsOptional() @IsString() label?: string;
}
class TableUpdateDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsNumber() x?: number;
  @IsOptional() @IsNumber() y?: number;
  @IsOptional() @IsInt() seats?: number;
  @IsOptional() @IsString() label?: string;
}
class AssignDto {
  @IsString() @IsNotEmpty() tableId!: string;
  @IsString() @IsNotEmpty() guestId!: string;
  @IsInt() seatIndex!: number;
}

@Injectable()
export class SeatingService {
  constructor(private p: PrismaService) {}

  charts(t: string, eventId: string) {
    return this.p.seatingChart.findMany({ where: { tenantId: t, eventId }, orderBy: { createdAt: 'desc' } });
  }
  async chart(t: string, id: string) {
    const c = await this.p.seatingChart.findFirst({
      where: { id, tenantId: t },
      include: { tables: { include: { assignments: { include: { guest: { select: { id: true, name: true, partySize: true } } } } } } },
    });
    if (!c) throw new NotFoundException('Chart not found');
    return c;
  }
  createChart(t: string, d: ChartDto) {
    return this.p.seatingChart.create({ data: { tenantId: t, eventId: d.eventId, name: d.name ?? 'מפת הושבה', canvas: d.canvas, isActive: true } });
  }
  addTable(t: string, d: TableDto) {
    return this.p.table.create({ data: { tenantId: t, chartId: d.chartId, type: (d.type as any) ?? 'ROUND', x: d.x ?? 0, y: d.y ?? 0, seats: d.seats ?? 10, label: d.label } });
  }
  async updateTable(t: string, id: string, d: TableUpdateDto) {
    const tb = await this.p.table.findFirst({ where: { id, tenantId: t } });
    if (!tb) throw new NotFoundException('Table not found');
    return this.p.table.update({ where: { id }, data: { ...d, type: d.type as any } });
  }
  async removeTable(t: string, id: string) {
    const tb = await this.p.table.findFirst({ where: { id, tenantId: t } });
    if (!tb) throw new NotFoundException('Table not found');
    await this.p.table.delete({ where: { id } });
    return { deleted: true };
  }
  async assign(t: string, d: AssignDto) {
    // free the seat if taken, then assign
    await this.p.seatAssignment.deleteMany({ where: { tableId: d.tableId, seatIndex: d.seatIndex } });
    const a = await this.p.seatAssignment.create({ data: { tenantId: t, tableId: d.tableId, guestId: d.guestId, seatIndex: d.seatIndex } });
    await this.p.eventGuest.update({ where: { id: d.guestId }, data: { tableId: d.tableId } }).catch(() => {});
    return a;
  }
  async unassign(t: string, id: string) {
    const a = await this.p.seatAssignment.findFirst({ where: { id, tenantId: t } });
    if (!a) throw new NotFoundException('Assignment not found');
    await this.p.seatAssignment.delete({ where: { id } });
    return { deleted: true };
  }
}

@Controller('seating')
class SeatingController {
  constructor(private s: SeatingService) {}
  @Get('charts') charts(@CurrentUser() u: AuthUser, @Query('eventId') eventId: string) { return this.s.charts(u.tenantId, eventId); }
  @Get('charts/:id') chart(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.chart(u.tenantId, id); }
  @Post('charts') createChart(@CurrentUser() u: AuthUser, @Body() d: ChartDto) { return this.s.createChart(u.tenantId, d); }
  @Post('tables') addTable(@CurrentUser() u: AuthUser, @Body() d: TableDto) { return this.s.addTable(u.tenantId, d); }
  @Patch('tables/:id') updateTable(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: TableUpdateDto) { return this.s.updateTable(u.tenantId, id, d); }
  @Delete('tables/:id') removeTable(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.removeTable(u.tenantId, id); }
  @Post('assign') assign(@CurrentUser() u: AuthUser, @Body() d: AssignDto) { return this.s.assign(u.tenantId, d); }
  @Delete('assign/:id') unassign(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.unassign(u.tenantId, id); }
}

@Module({ controllers: [SeatingController], providers: [SeatingService] })
export class SeatingModule {}
