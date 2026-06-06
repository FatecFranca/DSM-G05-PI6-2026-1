import { Controller, Get, UseGuards } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('enterprises')
@UseGuards(JwtAuthGuard)
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Get()
  findAll() {
    return this.enterpriseService.findAll();
  }
}
