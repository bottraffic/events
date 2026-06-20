import { Body, Controller, Injectable, Logger, Module, Post } from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../common/decorators';

function ilPhone(p?: string): string {
  const d = (p ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('972')) return '+' + d;
  if (d.startsWith('0')) return '+972' + d.slice(1);
  return '+' + d;
}

class SendSmsDto {
  @IsString() @IsNotEmpty() to!: string;
  @IsString() @IsNotEmpty() body!: string;
  @IsOptional() @IsString() customerId?: string;
}

@Injectable()
export class SmsService {
  private readonly log = new Logger('SMS');
  private readonly sid = process.env.TWILIO_SID ?? '';
  private readonly token = process.env.TWILIO_TOKEN ?? '';
  private readonly from = process.env.TWILIO_FROM ?? '';

  constructor(private p: PrismaService) {}

  status() {
    return { provider: this.sid ? 'twilio' : 'none', configured: !!(this.sid && this.token && this.from) };
  }

  private async deliver(to: string, body: string): Promise<{ status: string; externalId?: string; error?: string }> {
    const phone = ilPhone(to);
    if (!phone) return { status: 'FAILED', error: 'invalid phone' };
    if (!(this.sid && this.token && this.from)) return { status: 'NOT_CONFIGURED' };
    try {
      const auth = Buffer.from(`${this.sid}:${this.token}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: phone, From: this.from, Body: body }).toString(),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) { this.log.warn(`SMS failed: ${data?.message}`); return { status: 'FAILED', error: data?.message ?? `HTTP ${res.status}` }; }
      return { status: 'SENT', externalId: data?.sid };
    } catch (e: any) { return { status: 'FAILED', error: e?.message }; }
  }

  async send(tenantId: string, dto: SendSmsDto) {
    const phone = ilPhone(dto.to);
    let convo = await this.p.conversation.findFirst({ where: { tenantId, channel: 'SMS', contactPhone: phone } });
    if (!convo) convo = await this.p.conversation.create({ data: { tenantId, channel: 'SMS', contactPhone: phone, customerId: dto.customerId, status: 'open' } });
    const result = await this.deliver(dto.to, dto.body);
    const msg = await this.p.message.create({
      data: { tenantId, conversationId: convo.id, direction: 'OUTBOUND', body: dto.body, status: result.status === 'SENT' ? 'SENT' : result.status === 'FAILED' ? 'FAILED' : 'QUEUED', externalId: result.externalId },
    });
    await this.p.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
    return { conversationId: convo.id, messageId: msg.id, ...result };
  }

  /** Send to many recipients (e.g., all event guests). */
  async sendBulk(tenantId: string, recipients: string[], body: string) {
    const results = [];
    for (const to of recipients) results.push({ to, ...(await this.send(tenantId, { to, body })) });
    const sent = results.filter((r) => r.status === 'SENT').length;
    return { total: recipients.length, sent, results };
  }
}

@Controller('sms')
class SmsController {
  constructor(private s: SmsService) {}
  @Post('status') status() { return this.s.status(); }
  @Post('send') send(@CurrentUser() u: AuthUser, @Body() dto: SendSmsDto) { return this.s.send(u.tenantId, dto); }
  @Post('send-bulk') bulk(@CurrentUser() u: AuthUser, @Body() body: { recipients: string[]; body: string }) { return this.s.sendBulk(u.tenantId, body.recipients ?? [], body.body); }
}

@Module({ controllers: [SmsController], providers: [SmsService] })
export class SmsModule {}
