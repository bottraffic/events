import { Body, Controller, ForbiddenException, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterTenantDto } from './dto';
import { CurrentUser, AuthUser, Public } from '../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private assertPlatform(req: any) {
    const expected = process.env.PLATFORM_KEY ?? process.env.JWT_SECRET ?? 'change-me-in-production-super-secret';
    const key = req.headers['x-platform-key'];
    if (!key || key !== expected) {
      throw new ForbiddenException('forbidden');
    }
  }

  /** Operator-only: list accounts (filter=pending|all). */
  @Public()
  @Get('accounts')
  accounts(@Req() req: any, @Query('filter') filter?: 'pending' | 'all') {
    this.assertPlatform(req);
    return this.auth.listAccounts(filter ?? 'all');
  }

  /** Operator-only: approve a pending account + grant license (days; omit/0 = unlimited). */
  @Public()
  @Post('approve')
  approve(@Req() req: any, @Body() body: { tenantSlug: string; email: string; days?: number | null }) {
    this.assertPlatform(req);
    return this.auth.approveAccount(body.tenantSlug, body.email, body.days);
  }

  /** Operator-only: set/extend license (days; omit/0 = unlimited). */
  @Public()
  @Post('license')
  license(@Req() req: any, @Body() body: { tenantSlug: string; days?: number | null }) {
    this.assertPlatform(req);
    return this.auth.setLicense(body.tenantSlug, body.days);
  }

  /** Operator-only: open/close access (suspend). */
  @Public()
  @Post('access')
  access(@Req() req: any, @Body() body: { tenantSlug: string; open: boolean }) {
    this.assertPlatform(req);
    return this.auth.setAccess(body.tenantSlug, body.open);
  }

  /** Operator-only: edit tenant details. */
  @Public()
  @Post('edit-tenant')
  editTenant(@Req() req: any, @Body() body: { tenantSlug: string; name?: string; plan?: string }) {
    this.assertPlatform(req);
    return this.auth.editTenant(body.tenantSlug, { name: body.name, plan: body.plan });
  }

  /** Operator-only: delete a tenant. */
  @Public()
  @Post('delete-tenant')
  deleteTenant(@Req() req: any, @Body() body: { tenantSlug: string }) {
    this.assertPlatform(req);
    return this.auth.deleteTenant(body.tenantSlug);
  }

  @Public()
  @Post('register-tenant')
  registerTenant(@Body() dto: RegisterTenantDto) {
    return this.auth.registerTenant(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId);
  }

  @Post('push-token')
  setPushToken(@CurrentUser() user: AuthUser, @Body() body: { token: string }) {
    return this.auth.setPushToken(user.userId, body.token);
  }
}
