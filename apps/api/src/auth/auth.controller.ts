import { Body, Controller, ForbiddenException, Get, Post, Req } from '@nestjs/common';
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

  /** Operator-only: list accounts awaiting approval. */
  @Public()
  @Get('pending')
  pending(@Req() req: any) {
    this.assertPlatform(req);
    return this.auth.pendingAccounts();
  }

  /** Operator-only: approve or reject a pending account. */
  @Public()
  @Post('approve')
  approve(@Req() req: any, @Body() body: { tenantSlug: string; email: string; approve?: boolean }) {
    this.assertPlatform(req);
    return this.auth.approveAccount(body.tenantSlug, body.email, body.approve ?? true);
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
