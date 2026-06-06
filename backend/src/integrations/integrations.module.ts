import { Module, Global } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [TelegramService, EmailService],
  exports: [TelegramService, EmailService],
})
export class IntegrationsModule {}
