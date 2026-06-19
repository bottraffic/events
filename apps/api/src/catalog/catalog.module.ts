import {
  Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Query,
} from '@nestjs/common';
import { IsInt, IsNumber, IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

/* ===================== HALLS ===================== */
class HallDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() capacity?: number;
  @IsOptional() description?: any;
  @IsOptional() layout?: any;
}
@Injectable()
class HallsService {
  constructor(private p: PrismaService) {}
  list(t: string) { return this.p.hall.findMany({ where: { tenantId: t }, orderBy: { name: 'asc' } }); }
  create(t: string, d: HallDto) { return this.p.hall.create({ data: { tenantId: t, name: d.name!, capacity: d.capacity ?? 0, description: d.description, layout: d.layout } }); }
  async update(t: string, id: string, d: HallDto) { await this.exists(t, id); return this.p.hall.update({ where: { id }, data: { ...d } }); }
  async remove(t: string, id: string) { await this.exists(t, id); await this.p.hall.delete({ where: { id } }); return { deleted: true }; }
  private async exists(t: string, id: string) { const h = await this.p.hall.findFirst({ where: { id, tenantId: t } }); if (!h) throw new NotFoundException('Hall not found'); }
}
@Controller('halls')
class HallsController {
  constructor(private s: HallsService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: HallDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: HallDto) { return this.s.update(u.tenantId, id, d); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

/* ===================== VENDORS ===================== */
class VendorDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsInt() rating?: number;
  @IsOptional() @IsString() notes?: string;
}
@Injectable()
class VendorsService {
  constructor(private p: PrismaService) {}
  list(t: string, category?: string) { return this.p.vendor.findMany({ where: { tenantId: t, ...(category ? { category } : {}) }, orderBy: { name: 'asc' } }); }
  create(t: string, d: VendorDto) { return this.p.vendor.create({ data: { tenantId: t, name: d.name!, category: d.category ?? 'other', phone: d.phone, email: d.email, rating: d.rating, notes: d.notes } }); }
  async update(t: string, id: string, d: VendorDto) { await this.exists(t, id); return this.p.vendor.update({ where: { id }, data: { ...d } }); }
  async remove(t: string, id: string) { await this.exists(t, id); await this.p.vendor.delete({ where: { id } }); return { deleted: true }; }
  private async exists(t: string, id: string) { const v = await this.p.vendor.findFirst({ where: { id, tenantId: t } }); if (!v) throw new NotFoundException('Vendor not found'); }
}
@Controller('vendors')
class VendorsController {
  constructor(private s: VendorsService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('category') c?: string) { return this.s.list(u.tenantId, c); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: VendorDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: VendorDto) { return this.s.update(u.tenantId, id, d); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

/* ===================== CAMPAIGNS ===================== */
class CampaignDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() channel?: string;
  @IsOptional() @IsNumber() budget?: number;
  @IsOptional() utm?: any;
  @IsOptional() @IsString() status?: string;
}
@Injectable()
class CampaignsService {
  constructor(private p: PrismaService) {}
  list(t: string) { return this.p.campaign.findMany({ where: { tenantId: t }, include: { _count: { select: { leads: true } } } }); }
  create(t: string, d: CampaignDto) { return this.p.campaign.create({ data: { tenantId: t, name: d.name!, channel: d.channel ?? 'facebook', budget: d.budget, utm: d.utm, status: d.status ?? 'active' } }); }
  async update(t: string, id: string, d: CampaignDto) { await this.exists(t, id); return this.p.campaign.update({ where: { id }, data: { ...d } }); }
  async remove(t: string, id: string) { await this.exists(t, id); await this.p.campaign.delete({ where: { id } }); return { deleted: true }; }
  private async exists(t: string, id: string) { const c = await this.p.campaign.findFirst({ where: { id, tenantId: t } }); if (!c) throw new NotFoundException('Campaign not found'); }
}
@Controller('campaigns')
class CampaignsController {
  constructor(private s: CampaignsService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: CampaignDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: CampaignDto) { return this.s.update(u.tenantId, id, d); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

/* ===================== AUTOMATIONS ===================== */
class AutomationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() triggerType?: string;
  @IsOptional() conditions?: any;
  @IsOptional() actions?: any;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
@Injectable()
class AutomationsService {
  constructor(private p: PrismaService) {}
  list(t: string) { return this.p.automation.findMany({ where: { tenantId: t }, include: { _count: { select: { runs: true } } }, orderBy: { createdAt: 'desc' } }); }
  create(t: string, d: AutomationDto) { return this.p.automation.create({ data: { tenantId: t, name: d.name!, triggerType: d.triggerType ?? 'lead_created', conditions: d.conditions, actions: d.actions, isActive: d.isActive ?? true } }); }
  async update(t: string, id: string, d: AutomationDto) { await this.exists(t, id); return this.p.automation.update({ where: { id }, data: { ...d } }); }
  async remove(t: string, id: string) { await this.exists(t, id); await this.p.automation.delete({ where: { id } }); return { deleted: true }; }
  private async exists(t: string, id: string) { const a = await this.p.automation.findFirst({ where: { id, tenantId: t } }); if (!a) throw new NotFoundException('Automation not found'); }
}
@Controller('automations')
class AutomationsController {
  constructor(private s: AutomationsService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: AutomationDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: AutomationDto) { return this.s.update(u.tenantId, id, d); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

/* ===================== CALLS ===================== */
class CallDto {
  @IsOptional() @IsString() direction?: string;
  @IsOptional() @IsString() fromNumber?: string;
  @IsOptional() @IsString() toNumber?: string;
  @IsOptional() @IsInt() duration?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() leadId?: string;
  @IsOptional() @IsString() recordingUrl?: string;
}
@Injectable()
class CallsService {
  constructor(private p: PrismaService) {}
  list(t: string, f: { direction?: string; status?: string; from?: string; to?: string }) {
    return this.p.call.findMany({
      where: {
        tenantId: t,
        ...(f.direction ? { direction: f.direction as any } : {}),
        ...(f.status ? { status: f.status } : {}),
        ...(f.from || f.to ? { startedAt: { ...(f.from ? { gte: new Date(f.from) } : {}), ...(f.to ? { lte: new Date(f.to) } : {}) } } : {}),
      },
      include: { lead: { select: { id: true, name: true } }, aiInsight: true },
      orderBy: { startedAt: 'desc' },
    });
  }
  create(t: string, d: CallDto) { return this.p.call.create({ data: { tenantId: t, direction: (d.direction as any) ?? 'INBOUND', fromNumber: d.fromNumber ?? '', toNumber: d.toNumber ?? '', duration: d.duration ?? 0, status: d.status ?? 'completed', leadId: d.leadId, recordingUrl: d.recordingUrl } }); }
}
@Controller('calls')
class CallsController {
  constructor(private s: CallsService) {}
  @Get() list(@CurrentUser() u: AuthUser, @Query('direction') direction?: string, @Query('status') status?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.s.list(u.tenantId, { direction, status, from, to });
  }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: CallDto) { return this.s.create(u.tenantId, d); }
}

@Module({
  controllers: [HallsController, VendorsController, CampaignsController, AutomationsController, CallsController],
  providers: [HallsService, VendorsService, CampaignsService, AutomationsService, CallsService],
})
export class CatalogModule {}
