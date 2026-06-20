import { Body, Controller, Get, Injectable, Module, NotFoundException, Patch } from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

class LogoDto {
  @IsString() @IsNotEmpty() logo!: string; // data URL or hosted URL
}
class TenantUpdateDto {
  @IsOptional() @IsString() name?: string;
}

@Injectable()
export class TenantService {
  constructor(private p: PrismaService) {}

  async me(tenantId: string) {
    const t = await this.p.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, plan: true, status: true, licenseUntil: true, logoUrl: true },
    });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async setLogo(tenantId: string, logo: string) {
    await this.p.tenant.update({ where: { id: tenantId }, data: { logoUrl: logo } });
    return { ok: true, logoUrl: logo };
  }

  async removeLogo(tenantId: string) {
    await this.p.tenant.update({ where: { id: tenantId }, data: { logoUrl: null } });
    return { ok: true };
  }

  async update(tenantId: string, data: TenantUpdateDto) {
    await this.p.tenant.update({ where: { id: tenantId }, data: { ...(data.name ? { name: data.name } : {}) } });
    return this.me(tenantId);
  }
}

@Controller('tenant')
class TenantController {
  constructor(private s: TenantService) {}

  @Get()
  me(@CurrentUser() u: AuthUser) { return this.s.me(u.tenantId); }

  @Patch()
  update(@CurrentUser() u: AuthUser, @Body() dto: TenantUpdateDto) { return this.s.update(u.tenantId, dto); }

  @Patch('logo')
  setLogo(@CurrentUser() u: AuthUser, @Body() dto: LogoDto) { return this.s.setLogo(u.tenantId, dto.logo); }

  @Patch('logo/remove')
  removeLogo(@CurrentUser() u: AuthUser) { return this.s.removeLogo(u.tenantId); }
}

@Module({ controllers: [TenantController], providers: [TenantService] })
export class TenantModule {}
