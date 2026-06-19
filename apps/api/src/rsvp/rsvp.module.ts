import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Delete, Query, Req,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';

class GuestDto {
  @IsOptional() @IsString() eventId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsInt() @Min(1) partySize?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() groupId?: string;
  @IsOptional() @IsString() dietary?: string;
}
class GroupDto {
  @IsString() @IsNotEmpty() eventId!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsString() color?: string;
}
class RespondDto {
  @IsString() @IsNotEmpty() guestId!: string;
  @IsString() @IsNotEmpty() status!: string;
  @IsOptional() @IsInt() @Min(0) partySize?: number;
  @IsOptional() @IsString() message?: string;
}

@Injectable()
export class RsvpService {
  constructor(private p: PrismaService) {}

  guests(t: string, eventId?: string, status?: string) {
    return this.p.eventGuest.findMany({
      where: { tenantId: t, ...(eventId ? { eventId } : {}), ...(status ? { status: status as any } : {}) },
      include: { group: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  async summary(t: string, eventId: string) {
    const all = await this.p.eventGuest.findMany({ where: { tenantId: t, eventId } });
    const by = (s: string) => all.filter((g) => g.status === s);
    const seats = (arr: typeof all) => arr.reduce((a, g) => a + (g.partySize || 1), 0);
    return {
      guests: all.length,
      confirmed: by('YES').length, confirmedSeats: seats(by('YES')),
      declined: by('NO').length, pending: by('PENDING').length, maybe: by('MAYBE').length,
      totalSeats: seats(all),
    };
  }
  createGuest(t: string, d: GuestDto) {
    return this.p.eventGuest.create({ data: { tenantId: t, eventId: d.eventId!, name: d.name!, phone: d.phone, partySize: d.partySize ?? 1, status: (d.status as any) ?? 'PENDING', groupId: d.groupId, dietary: d.dietary } });
  }
  async updateGuest(t: string, id: string, d: GuestDto) {
    await this.guestExists(t, id);
    return this.p.eventGuest.update({ where: { id }, data: { name: d.name, phone: d.phone, partySize: d.partySize, status: d.status as any, groupId: d.groupId, dietary: d.dietary } });
  }
  async removeGuest(t: string, id: string) {
    await this.guestExists(t, id);
    await this.p.eventGuest.delete({ where: { id } });
    return { deleted: true };
  }
  groups(t: string, eventId?: string) {
    return this.p.guestGroup.findMany({ where: { tenantId: t, ...(eventId ? { eventId } : {}) }, include: { _count: { select: { guests: true } } } });
  }
  createGroup(t: string, d: GroupDto) {
    return this.p.guestGroup.create({ data: { tenantId: t, eventId: d.eventId, name: d.name, color: d.color ?? '#10b981' } });
  }

  /* public RSVP submit */
  async respond(d: RespondDto, ip?: string) {
    const guest = await this.p.eventGuest.findUnique({ where: { id: d.guestId } });
    if (!guest) throw new NotFoundException('Guest not found');
    const partySize = d.partySize ?? guest.partySize;
    await this.p.eventGuest.update({ where: { id: guest.id }, data: { status: d.status as any, partySize } });
    const resp = await this.p.rsvpResponse.create({
      data: { tenantId: guest.tenantId, guestId: guest.id, status: d.status as any, partySize, message: d.message, ip },
    });
    return { ok: true, responseId: resp.id, status: d.status };
  }

  private async guestExists(t: string, id: string) {
    const g = await this.p.eventGuest.findFirst({ where: { id, tenantId: t } });
    if (!g) throw new NotFoundException('Guest not found');
    return g;
  }
}

@Controller('rsvp')
class RsvpController {
  constructor(private s: RsvpService) {}
  @Get('guests') guests(@CurrentUser() u: AuthUser, @Query('eventId') eventId?: string, @Query('status') status?: string) { return this.s.guests(u.tenantId, eventId, status); }
  @Get('summary') summary(@CurrentUser() u: AuthUser, @Query('eventId') eventId: string) { return this.s.summary(u.tenantId, eventId); }
  @Post('guests') createGuest(@CurrentUser() u: AuthUser, @Body() d: GuestDto) { return this.s.createGuest(u.tenantId, d); }
  @Patch('guests/:id') updateGuest(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: GuestDto) { return this.s.updateGuest(u.tenantId, id, d); }
  @Delete('guests/:id') removeGuest(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.removeGuest(u.tenantId, id); }
  @Get('groups') groups(@CurrentUser() u: AuthUser, @Query('eventId') eventId?: string) { return this.s.groups(u.tenantId, eventId); }
  @Post('groups') createGroup(@CurrentUser() u: AuthUser, @Body() d: GroupDto) { return this.s.createGroup(u.tenantId, d); }
  @Public() @Post('respond') respond(@Body() d: RespondDto, @Req() req: any) { return this.s.respond(d, req.ip); }
}

@Module({ controllers: [RsvpController], providers: [RsvpService] })
export class RsvpModule {}
