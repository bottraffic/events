import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterTenantDto } from './dto';

const DEFAULT_STAGES = [
  { name: 'ליד חדש', order: 1, color: '#6366f1', type: 'OPEN' as const },
  { name: 'תיאום פגישה', order: 2, color: '#8b5cf6', type: 'OPEN' as const },
  { name: 'פגישה בוצעה', order: 3, color: '#0ea5e9', type: 'OPEN' as const },
  { name: 'הצעת מחיר', order: 4, color: '#f59e0b', type: 'OPEN' as const },
  { name: 'מו"מ', order: 5, color: '#f97316', type: 'OPEN' as const },
  { name: 'נסגר', order: 6, color: '#10b981', type: 'WON' as const },
  { name: 'הפסד', order: 7, color: '#ef4444', type: 'LOST' as const },
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private slugify(name: string): string {
    const base = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9֐-׿]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${base || 'venue'}-${Math.random().toString(36).slice(2, 6)}`;
  }

  async registerTenant(dto: RegisterTenantDto) {
    const slug = this.slugify(dto.venueName);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.venueName, slug, subdomain: slug, plan: 'STARTER', status: 'TRIAL' },
      });

      await tx.pipelineStage.createMany({
        data: DEFAULT_STAGES.map((s) => ({ ...s, tenantId: tenant.id })),
      });

      const role = await tx.role.create({
        data: { tenantId: tenant.id, name: 'מנהל', level: 'ADMIN', isSystem: true },
      });

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.adminName,
          email: dto.email,
          passwordHash,
          status: 'pending', // requires operator approval before first login
          userRoles: { create: { roleId: role.id } },
        },
      });

      return { tenant, user, roles: [role.level] };
    });

    // Account is created in a pending state and must be approved remotely by the
    // platform operator. No session is issued until approval.
    return {
      pending: true,
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
      message: 'החשבון נוצר וממתין לאישור מנהל המערכת',
    };
  }

  /** Operator-only: approve (or reject) a pending account. Guarded by platform key. */
  async approveAccount(tenantSlug: string, email: string, approve = true) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new UnauthorizedException('Tenant not found');
    await this.prisma.user.updateMany({
      where: { tenantId: tenant.id, email },
      data: { status: approve ? 'active' : 'suspended' },
    });
    if (approve) {
      await this.prisma.tenant.update({ where: { id: tenant.id }, data: { status: 'ACTIVE' } });
    }
    return { ok: true, status: approve ? 'active' : 'suspended' };
  }

  /** List accounts awaiting approval (operator-only). */
  async pendingAccounts() {
    return this.prisma.user.findMany({
      where: { status: 'pending', deletedAt: null },
      select: { id: true, name: true, email: true, createdAt: true, tenant: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
    if (!tenant) throw new UnauthorizedException('Invalid credentials');

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.status === 'pending') throw new UnauthorizedException('החשבון ממתין לאישור מנהל המערכת');
    if (user.status === 'suspended') throw new UnauthorizedException('החשבון מושעה — פנה למנהל המערכת');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const roles = user.userRoles.map((ur) => ur.role.level);
    const tokens = await this.issueTokens(user.id, tenant.id, user.email, roles);
    return { tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }, user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET ?? 'change-me-in-production-super-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(payload.sub, payload.tenantId, payload.email, payload.roles);
  }

  async setPushToken(userId: string, token: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { pushToken: token } });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException();
    return {
      ...this.sanitize(user),
      roles: user.userRoles.map((ur) => ur.role.level),
    };
  }

  private async issueTokens(sub: string, tenantId: string, email: string, roles: string[]) {
    const payload = { sub, tenantId, email, roles };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.REFRESH_EXPIRES_IN ?? '30d',
    });
    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
