import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Delete, Query,
} from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';

class CreateInvitationDto {
  @IsString() @IsNotEmpty() eventId!: string;
  @IsOptional() @IsString() templateId?: string;
  @IsOptional() design?: any;
  @IsOptional() mediaUrls?: any;
}
class UpdateInvitationDto {
  @IsOptional() design?: any;
  @IsOptional() mediaUrls?: any;
  @IsOptional() templateId?: string;
}

function slugify(s: string) {
  return (s || 'event').replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).slice(2, 7);
}

@Injectable()
export class InvitationsService {
  constructor(private p: PrismaService) {}

  list(t: string, eventId?: string) {
    return this.p.invitation.findMany({ where: { tenantId: t, ...(eventId ? { eventId } : {}) }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(t: string, id: string) {
    const i = await this.p.invitation.findFirst({ where: { id, tenantId: t }, include: { _count: { select: { rsvpResponses: true } } } });
    if (!i) throw new NotFoundException('Invitation not found');
    return i;
  }
  create(t: string, d: CreateInvitationDto) {
    return this.p.invitation.create({ data: { tenantId: t, eventId: d.eventId, templateId: d.templateId, design: d.design, mediaUrls: d.mediaUrls, slug: slugify((d.design?.groom as string) ?? 'event') } });
  }
  async update(t: string, id: string, d: UpdateInvitationDto) {
    await this.exists(t, id);
    return this.p.invitation.update({ where: { id }, data: { ...d } });
  }
  async publish(t: string, id: string) {
    await this.exists(t, id);
    const inv = await this.p.invitation.update({ where: { id }, data: { published: true } });
    return { ...inv, publicUrl: `https://events.webon.org.il/i/${inv.slug}` };
  }
  async remove(t: string, id: string) {
    await this.exists(t, id);
    await this.p.invitation.delete({ where: { id } });
    return { deleted: true };
  }

  /* public */
  async getBySlug(slug: string) {
    const i = await this.p.invitation.findUnique({
      where: { slug },
      include: { event: { include: { customer: { select: { name: true, partnerName: true } }, hall: { select: { name: true } } } } },
    });
    if (!i) throw new NotFoundException('Invitation not found');
    return { slug: i.slug, design: i.design, mediaUrls: i.mediaUrls, mapLat: i.mapLat, mapLng: i.mapLng, event: { date: i.event?.eventDate, hall: i.event?.hall?.name } };
  }

  private async exists(t: string, id: string) {
    const i = await this.p.invitation.findFirst({ where: { id, tenantId: t } });
    if (!i) throw new NotFoundException('Invitation not found');
    return i;
  }
}

@Controller('invitations')
class InvitationsController {
  constructor(private s: InvitationsService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('eventId') eventId?: string) { return this.s.list(u.tenantId, eventId); }
  @Public() @Get('public/:slug') publicView(@Param('slug') slug: string) { return this.s.getBySlug(slug); }
  @Get(':id') findOne(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.findOne(u.tenantId, id); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: CreateInvitationDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: UpdateInvitationDto) { return this.s.update(u.tenantId, id, d); }
  @Post(':id/publish') publish(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.publish(u.tenantId, id); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

@Module({ controllers: [InvitationsController], providers: [InvitationsService] })
export class InvitationsModule {}
