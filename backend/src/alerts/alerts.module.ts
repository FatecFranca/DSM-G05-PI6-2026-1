import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'alerts_queue',
    }),
    PrismaModule,
    IntegrationsModule
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsProcessor],
})
export class AlertsModule {}
