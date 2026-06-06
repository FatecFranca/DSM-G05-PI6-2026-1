import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AlertModel {
  id: string;
  commodityName: string;
  condition: string;
  channel: string;
  active: boolean;
}

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number): Promise<AlertModel[]> {
    const alertas = await this.prisma.alerta.findMany({
      where: {
        id_usuario: userId,
      },
      include: {
        materia_prima: true,
        usuario: true,
      },
    });

    return alertas.map(alerta => {
      let formatCondition = alerta.tipo_alerta.replace(/_/g, ' ');
      if (alerta.valor_limite_opcional) {
        formatCondition += ` R$ ${Number(alerta.valor_limite_opcional).toFixed(2)}`;
      }
      return {
        id: String(alerta.id_alerta),
        commodityName: alerta.materia_prima?.nome || 'Desconhecida',
        condition: formatCondition,
        channel: alerta.usuario?.canal_notificacao_preferido || 'email',
        active: alerta.ativo ?? true,
      };
    });
  }

  async create(
    userId: number,
    dto: {
      commodityId: number;
      condition: 'Abaixo' | 'Acima' | 'bom';
      targetPrice?: number;
      channel: 'Telegram' | 'E-mail';
    },
  ): Promise<AlertModel> {
    let tipo_alerta = 'variacao_percentual';
    if (dto.condition === 'Abaixo') {
      tipo_alerta = 'preco_maximo_compra';
    } else if (dto.condition === 'Acima') {
      tipo_alerta = 'preco_subir_acima';
    } else if (dto.condition === 'bom') {
      tipo_alerta = 'mudanca_para_bom';
    }

    const alerta = await this.prisma.alerta.create({
      data: {
        id_usuario: userId,
        id_materia_prima: dto.commodityId,
        tipo_alerta,
        valor_limite_opcional: dto.targetPrice ?? null,
        ativo: true,
      },
      include: {
        materia_prima: true,
        usuario: true,
      },
    });

    const canalFormatado = dto.channel.toLowerCase().replace('-', '');
    await this.prisma.usuario.update({
      where: { id_usuario: userId },
      data: { canal_notificacao_preferido: canalFormatado },
    });

    let formatCondition = tipo_alerta.replace(/_/g, ' ');
    if (alerta.valor_limite_opcional) {
      formatCondition += ` R$ ${Number(alerta.valor_limite_opcional).toFixed(2)}`;
    }

    return {
      id: String(alerta.id_alerta),
      commodityName: alerta.materia_prima?.nome || 'Desconhecida',
      condition: formatCondition,
      channel: canalFormatado,
      active: alerta.ativo ?? true,
    };
  }

  async toggleStatus(id: string): Promise<AlertModel> {
    const alertId = parseInt(id, 10);
    const existing = await this.prisma.alerta.findUnique({ where: { id_alerta: alertId } });
    if (!existing) {
      throw new NotFoundException(`Alerta com id ${id} não encontrado`);
    }

    const updated = await this.prisma.alerta.update({
      where: { id_alerta: alertId },
      data: { ativo: !existing.ativo },
      include: { materia_prima: true, usuario: true }
    });

    let formatCondition = updated.tipo_alerta.replace(/_/g, ' ');
    if (updated.valor_limite_opcional) {
      formatCondition += ` R$ ${Number(updated.valor_limite_opcional).toFixed(2)}`;
    }

    return {
      id: String(updated.id_alerta),
      commodityName: updated.materia_prima?.nome || 'Desconhecida',
      condition: formatCondition,
      channel: updated.usuario?.canal_notificacao_preferido || 'email',
      active: updated.ativo ?? true,
    };
  }

  async remove(id: string): Promise<void> {
    const alertId = parseInt(id, 10);
    const existing = await this.prisma.alerta.findUnique({ where: { id_alerta: alertId } });
    if (!existing) {
      throw new NotFoundException(`Alerta com id ${id} não encontrado`);
    }

    await this.prisma.notificacao.deleteMany({
      where: { id_alerta: alertId },
    });

    await this.prisma.alerta.delete({
      where: { id_alerta: alertId },
    });
  }
}
