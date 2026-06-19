import {
  Body,
  Controller,
  Get,
  Injectable,
  Logger,
  Module,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';

/* ---------- helpers ---------- */
/** Normalize an Israeli phone to international digits for WhatsApp (0501234567 -> 972501234567). */
function waPhone(p?: string): string {
  const d = (p ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('972')) return d;
  if (d.startsWith('0')) return '972' + d.slice(1);
  return d;
}

interface SendResult {
  status: 'SENT' | 'QUEUED' | 'FAILED';
  externalId?: string;
  waLink?: string;
  error?: string;
}

/* ---------- DTOs ---------- */
class SendDto {
  @IsString() @IsNotEmpty() to!: string;
  @IsString() @IsNotEmpty() body!: string;
  @IsOptional() @IsString() customerId?: string;
}
class TemplateDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() body!: string;
}

/* ---------- service ---------- */
@Injectable()
export class WhatsappService {
  private readonly log = new Logger('WhatsApp');
  private readonly provider = (process.env.WHATSAPP_PROVIDER ?? 'link').toLowerCase();
  private readonly token = process.env.WHATSAPP_TOKEN ?? '';
  private readonly phoneId = process.env.WHATSAPP_PHONE_ID ?? '';
  private readonly verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? 'simcha-verify';
  private readonly tenantSlug = process.env.WHATSAPP_TENANT_SLUG ?? 'demo';

  constructor(private prisma: PrismaService) {}

  status() {
    const configured = this.provider === 'meta' && !!this.token && !!this.phoneId;
    return { provider: this.provider, configured };
  }

  /** Low-level provider send. Falls back to a wa.me click-to-chat link when no API creds. */
  private async deliver(to: string, body: string): Promise<SendResult> {
    const phone = waPhone(to);
    if (!phone) return { status: 'FAILED', error: 'invalid phone' };

    if (this.provider === 'meta' && this.token && this.phoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${this.phoneId}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body } }),
        });
        const data: any = await res.json().catch(() => ({}));
        if (!res.ok) {
          this.log.warn(`Meta send failed: ${JSON.stringify(data?.error ?? data)}`);
          return { status: 'FAILED', error: data?.error?.message ?? `HTTP ${res.status}` };
        }
        return { status: 'SENT', externalId: data?.messages?.[0]?.id };
      } catch (e: any) {
        return { status: 'FAILED', error: e?.message ?? 'send error' };
      }
    }

    // link fallback — no API account needed; returns a ready wa.me deep link
    return { status: 'QUEUED', waLink: `https://wa.me/${phone}?text=${encodeURIComponent(body)}` };
  }

  private async getConversation(tenantId: string, phone: string, customerId?: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { tenantId, channel: 'WHATSAPP', contactPhone: phone },
    });
    if (existing) return existing;
    return this.prisma.conversation.create({
      data: { tenantId, channel: 'WHATSAPP', contactPhone: phone, customerId, status: 'open' },
    });
  }

  async send(tenantId: string, dto: SendDto) {
    const phone = waPhone(dto.to);
    const convo = await this.getConversation(tenantId, phone, dto.customerId);
    const result = await this.deliver(dto.to, dto.body);
    const msg = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId: convo.id,
        direction: 'OUTBOUND',
        body: dto.body,
        status: result.status === 'FAILED' ? 'FAILED' : result.status === 'SENT' ? 'SENT' : 'QUEUED',
        externalId: result.externalId,
      },
    });
    await this.prisma.conversation.update({
      where: { id: convo.id },
      data: { lastMessageAt: new Date() },
    });
    return { conversationId: convo.id, messageId: msg.id, ...result };
  }

  listConversations(tenantId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      take: 100,
    });
  }

  messages(tenantId: string, conversationId: string) {
    return this.prisma.message.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  listTemplates(tenantId: string) {
    return this.prisma.messageTemplate.findMany({ where: { tenantId, channel: 'WHATSAPP' } });
  }
  createTemplate(tenantId: string, dto: TemplateDto) {
    return this.prisma.messageTemplate.create({
      data: { tenantId, channel: 'WHATSAPP', name: dto.name, body: dto.body },
    });
  }

  /* ----- inbound webhook (Meta Cloud API) ----- */
  verifyWebhook(mode?: string, token?: string, challenge?: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) return challenge ?? '';
    return null;
  }

  async handleWebhook(payload: any) {
    try {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug: this.tenantSlug } });
      if (!tenant) return;
      const tenantId = tenant.id;
      for (const entry of payload?.entry ?? []) {
        for (const change of entry?.changes ?? []) {
          const value = change?.value ?? {};
          // inbound messages
          for (const m of value.messages ?? []) {
            const phone = waPhone(m.from);
            const body = m.text?.body ?? `[${m.type}]`;
            const convo = await this.getConversation(tenantId, phone);
            await this.prisma.message.create({
              data: {
                tenantId,
                conversationId: convo.id,
                direction: 'INBOUND',
                body,
                status: 'DELIVERED',
                externalId: m.id,
              },
            });
            await this.prisma.conversation.update({
              where: { id: convo.id },
              data: { lastMessageAt: new Date() },
            });
          }
          // delivery/read status updates
          for (const s of value.statuses ?? []) {
            const map: Record<string, any> = {
              sent: 'SENT',
              delivered: 'DELIVERED',
              read: 'READ',
              failed: 'FAILED',
            };
            const st = map[s.status];
            if (st && s.id) {
              await this.prisma.message.updateMany({
                where: { externalId: s.id },
                data: { status: st },
              });
            }
          }
        }
      }
    } catch (e: any) {
      this.log.error(`webhook error: ${e?.message}`);
    }
  }
}

/* ---------- controllers ---------- */
@Controller('whatsapp')
class WhatsappController {
  constructor(private wa: WhatsappService) {}

  @Get('status')
  status() {
    return this.wa.status();
  }

  @Post('send')
  send(@CurrentUser() user: AuthUser, @Body() dto: SendDto) {
    return this.wa.send(user.tenantId, dto);
  }

  @Get('templates')
  templates(@CurrentUser() user: AuthUser) {
    return this.wa.listTemplates(user.tenantId);
  }

  @Post('templates')
  createTemplate(@CurrentUser() user: AuthUser, @Body() dto: TemplateDto) {
    return this.wa.createTemplate(user.tenantId, dto);
  }

  @Public()
  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.wa.verifyWebhook(mode, token, challenge) ?? 'forbidden';
  }

  @Public()
  @Post('webhook')
  async webhook(@Body() body: any) {
    await this.wa.handleWebhook(body);
    return { received: true };
  }
}

@Controller('conversations')
class ConversationsController {
  constructor(private wa: WhatsappService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.wa.listConversations(user.tenantId);
  }

  @Get(':id')
  messages(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.wa.messages(user.tenantId, id);
  }
}

@Module({
  controllers: [WhatsappController, ConversationsController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
