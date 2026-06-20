import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { EventsModule } from './events/events.module';
import { ReportsModule } from './reports/reports.module';
import { CustomersModule } from './customers/customers.module';
import { TasksModule } from './tasks/tasks.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { CatalogModule } from './catalog/catalog.module';
import { ContractsModule } from './contracts/contracts.module';
import { InvitationsModule } from './invitations/invitations.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { SeatingModule } from './seating/seating.module';
import { CompatModule } from './compat/compat.module';
import { TenantModule } from './tenant/tenant.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { SmsModule } from './sms/sms.module';
import { HealthController } from './health.controller';
import { JwtAuthGuard, RolesGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    LeadsModule,
    PipelineModule,
    EventsModule,
    ReportsModule,
    CustomersModule,
    TasksModule,
    WhatsappModule,
    CatalogModule,
    ContractsModule,
    InvitationsModule,
    RsvpModule,
    SeatingModule,
    CompatModule,
    TenantModule,
    TelemetryModule,
    SmsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
