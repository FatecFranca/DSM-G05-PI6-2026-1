import { Controller, Get, Patch, Param, Delete, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    @InjectQueue('alerts_queue') private readonly alertsQueue: Queue,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = parseInt(req.user.sub, 10);
    return this.alertsService.findAll(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() body: {
      commodityId: number;
      condition: 'Abaixo' | 'Acima' | 'bom';
      targetPrice?: number;
      channel: 'Telegram' | 'E-mail';
    },
  ) {
    const userId = parseInt(req.user.sub, 10);
    const alert = await this.alertsService.create(userId, body);

    await this.alertsQueue.add('price_alert_triggered', {
      commodity_id: body.commodityId,
      only_alert_id: parseInt(alert.id, 10),
    });

    return alert;
  }

  @Post('trigger-test-job')
  async triggerTestJob(@Body() body: { commodityId: number; currentPrice: number; variation: number }) {
    const { commodityId, currentPrice, variation } = body;
    const job = await this.alertsQueue.add('price_alert_triggered', {
      commodity_id: commodityId || 1,
      current_price: currentPrice || 50.0,
      variation: variation || 5.0,
    });
    return { success: true, jobId: job.id };
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggle(@Param('id') id: string) {
    return this.alertsService.toggleStatus(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }
}



