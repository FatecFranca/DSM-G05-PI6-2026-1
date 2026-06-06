import { Module } from '@nestjs/common';
import { AssistentController } from './assistent.controller';
import { AssistentService } from './assistent.service';

@Module({
  controllers: [AssistentController],
  providers: [AssistentService]
})
export class AssistentModule {}
