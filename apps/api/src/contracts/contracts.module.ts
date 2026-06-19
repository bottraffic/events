import {
  Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Delete, Req,
} from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';

class CreateContractDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsString() customerId?: string;
  @IsOptional() @IsString() eventId?: string;
  @IsOptional() mergeData?: any;
}
class UpdateContractDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() customerId?: string;
  @IsOptional() mergeData?: any;
}
class SignDto {
  @IsString() @IsNotEmpty() signerName!: string;
  @IsOptional() @IsString() signatureImg?: string;
}

@Injectable()
export class ContractsService {
  constructor(private p: PrismaService) {}

  list(t: string) {
    return this.p.contract.findMany({
      where: { tenantId: t },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findOne(t: string, id: string) {
    const c = await this.p.contract.findFirst({ where: { id, tenantId: t }, include: { signatures: true, auditTrail: { orderBy: { timestamp: 'desc' } } } });
    if (!c) throw new NotFoundException('Contract not found');
    return c;
  }
  create(t: string, d: CreateContractDto) {
    return this.p.contract.create({ data: { tenantId: t, title: d.title, bodyHtml: d.bodyHtml, customerId: d.customerId, eventId: d.eventId, mergeData: d.mergeData, status: 'DRAFT' } });
  }
  async update(t: string, id: string, d: UpdateContractDto) {
    await this.exists(t, id);
    return this.p.contract.update({ where: { id }, data: { ...d, status: d.status as any } });
  }
  async send(t: string, id: string, ip?: string) {
    const c = await this.exists(t, id);
    const token = c.signToken ?? randomUUID();
    const updated = await this.p.contract.update({ where: { id }, data: { status: 'SENT', signToken: token } });
    await this.audit(t, id, 'sent', ip);
    return { ...updated, signUrl: `https://events.webon.org.il/sign/${token}` };
  }
  async remove(t: string, id: string) {
    await this.exists(t, id);
    await this.p.contract.delete({ where: { id } });
    return { deleted: true };
  }

  /* ---- public signing ---- */
  async getByToken(token: string) {
    const c = await this.p.contract.findUnique({ where: { signToken: token }, include: { signatures: true } });
    if (!c) throw new NotFoundException('Contract not found');
    return { id: c.id, title: c.title, bodyHtml: c.bodyHtml, status: c.status, mergeData: c.mergeData, signed: c.signatures.length > 0 };
  }
  async signByToken(token: string, d: SignDto, ip?: string, ua?: string) {
    const c = await this.p.contract.findUnique({ where: { signToken: token } });
    if (!c) throw new NotFoundException('Contract not found');
    if (c.status === 'SIGNED') return { alreadySigned: true };
    const sig = await this.p.contractSignature.create({
      data: { tenantId: c.tenantId, contractId: c.id, signerName: d.signerName, signatureImg: d.signatureImg, ip, device: ua, hash: randomUUID() },
    });
    await this.p.contract.update({ where: { id: c.id }, data: { status: 'SIGNED' } });
    await this.audit(c.tenantId, c.id, 'signed', ip, ua);
    return { signed: true, signatureId: sig.id, signedAt: sig.signedAt };
  }

  private async audit(t: string, contractId: string, action: string, ip?: string, ua?: string) {
    return this.p.contractAuditTrail.create({ data: { tenantId: t, contractId, action, ip, userAgent: ua } });
  }
  private async exists(t: string, id: string) {
    const c = await this.p.contract.findFirst({ where: { id, tenantId: t } });
    if (!c) throw new NotFoundException('Contract not found');
    return c;
  }
}

@Controller('contracts')
class ContractsController {
  constructor(private s: ContractsService) {}
  @Get() list(@CurrentUser() u: AuthUser) { return this.s.list(u.tenantId); }

  @Public() @Get('sign/:token') getSign(@Param('token') token: string) { return this.s.getByToken(token); }
  @Public() @Post('sign/:token') doSign(@Param('token') token: string, @Body() d: SignDto, @Req() req: any) {
    return this.s.signByToken(token, d, req.ip, req.headers['user-agent']);
  }

  @Get(':id') findOne(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.findOne(u.tenantId, id); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() d: CreateContractDto) { return this.s.create(u.tenantId, d); }
  @Patch(':id') update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() d: UpdateContractDto) { return this.s.update(u.tenantId, id, d); }
  @Post(':id/send') send(@CurrentUser() u: AuthUser, @Param('id') id: string, @Req() req: any) { return this.s.send(u.tenantId, id, req.ip); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.s.remove(u.tenantId, id); }
}

@Module({ controllers: [ContractsController], providers: [ContractsService] })
export class ContractsModule {}
