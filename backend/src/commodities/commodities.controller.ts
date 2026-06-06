import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CommoditiesService } from './commodities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('commodities')
@UseGuards(JwtAuthGuard)
export class CommoditiesController {
  constructor(private readonly commoditiesService: CommoditiesService) {}

  /**
   * GET /api/v1/commodities
   * Busca commodities na API externa, classifica cada uma via /api/v1/classify
   * e retorna o payload serializado para o frontend.
   */
  @Get()
  findAll() {
    return this.commoditiesService.findAll();
  }

  /**
   * GET /api/v1/commodities/:id
   * Retorna dados enriquecidos de uma commodity: histórico, classificação e previsões.
   * Agrega 3 chamadas à API externa em paralelo (mockadas enquanto API não está disponível).
   * Throws 404 se não encontrado.
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.commoditiesService.findById(id);
  }
}
