import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface PriceAlertJobData {
  commodity_id: number;
  current_price?: number;
  variation?: number;
  only_alert_id?: number;
}
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../integrations/telegram.service';
import { EmailService } from '../integrations/email.service';

@Processor('alerts_queue')
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<PriceAlertJobData, void, string>): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'price_alert_triggered') {
      const { commodity_id, current_price, variation, only_alert_id } = job.data;

      this.logger.log(
        `Received price alert trigger for commodity ID ${commodity_id}. Fallback Price = ${current_price}`,
      );
      const recomendacao = await this.prisma.recomendacao_compra.findFirst({
        where: {
          id_materia_prima: commodity_id,
        },
        orderBy: {
          criado_em: 'desc',
        },
      });

      const preco_atual_referencia = recomendacao
        ? Number(recomendacao.preco_atual_referencia)
        : Number(current_price);

      const variacao_percentual = recomendacao?.variacao_percentual
        ? Number(recomendacao.variacao_percentual)
        : Number(variation || 0);

      const classificacao_compra = recomendacao?.classificacao_compra || 'regular';

      this.logger.log(
        `Resolved Commodity values -> Price: R$ ${preco_atual_referencia}, Variation: ${variacao_percentual}%, Classification: ${classificacao_compra}`,
      );

      const activeAlerts = await this.prisma.alerta.findMany({
        where: {
          id_materia_prima: commodity_id,
          ativo: true,
          ...(only_alert_id ? { id_alerta: Number(only_alert_id) } : {}),
        },
        include: {
          usuario: true,
          materia_prima: true,
        },
      });

      for (const alerta of activeAlerts) {
        let dispararAlerta = false;

        if (alerta.tipo_alerta === 'preco_maximo_compra' && alerta.valor_limite_opcional) {
          const limite = Number(alerta.valor_limite_opcional);
          if (preco_atual_referencia <= limite) {
            dispararAlerta = true;
          }
        } else if (alerta.tipo_alerta === 'preco_subir_acima' && alerta.valor_limite_opcional) {
          const limite = Number(alerta.valor_limite_opcional);
          if (preco_atual_referencia >= limite) {
            dispararAlerta = true;
          }
        } else if (alerta.tipo_alerta === 'mudanca_para_bom') {
          if (classificacao_compra === 'bom') {
            dispararAlerta = true;
          }
        } else if (
          alerta.tipo_alerta === 'variacao_percentual' &&
          alerta.variacao_percentual_limite_opcional
        ) {
          const limiteVariacao = Math.abs(Number(alerta.variacao_percentual_limite_opcional));
          if (Math.abs(variacao_percentual) >= limiteVariacao) {
            dispararAlerta = true;
          }
        } else {
          // TODO: unknown alert type — currently fires unconditionally; define behaviour before adding new types
          dispararAlerta = true;
        }

        if (!dispararAlerta) {
          this.logger.log(
            `Alert ID ${alerta.id_alerta} for user ${alerta.usuario.nome} conditions not met. Skipping.`,
          );
          continue;
        }

        this.logger.log(
          `Alert ID ${alerta.id_alerta} for user ${alerta.usuario.nome} triggered! Sending notification...`,
        );

        const limiteFormatado = alerta.valor_limite_opcional
          ? `(Limite: R$ ${Number(alerta.valor_limite_opcional).toFixed(2)})`
          : '';
        const canal = (alerta.usuario.canal_notificacao_preferido || 'email').toLowerCase();
        const titulo = `Alerta: ${alerta.materia_prima.nome}`;

        const mensagem =
          `*Alerta de Mercado - ${alerta.materia_prima.nome.toUpperCase()}*\n\n` +
          `A condição do seu alerta foi atendida!\n` +
          `• *Preço Atual:* R$ ${preco_atual_referencia.toFixed(2)}\n` +
          `• *Variação:* ${variacao_percentual > 0 ? '+' : ''}${variacao_percentual.toFixed(2)}%\n` +
          `• *Recomendação:* ${classificacao_compra.toUpperCase()}\n` +
          `• *Condição monitorada:* ${alerta.tipo_alerta.replace(/_/g, ' ')} ${limiteFormatado}\n\n` +
          `Acesse o painel do Commodities Analytics para mais informações.`;

        const variacaoSinal = variacao_percentual > 0 ? '+' : '';
        const variacaoColor = variacao_percentual >= 0 ? '#10b981' : '#ef4444';
        const classificacaoColor =
          classificacao_compra === 'bom'
            ? '#10b981'
            : classificacao_compra === 'ruim'
              ? '#ef4444'
              : '#f59e0b';
        const classificacaoBg =
          classificacao_compra === 'bom'
            ? 'rgba(16,185,129,0.15)'
            : classificacao_compra === 'ruim'
              ? 'rgba(239,68,68,0.15)'
              : 'rgba(245,158,11,0.15)';

        const mensagemHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Header com gradiente igual ao app -->
          <tr>
            <td style="background:linear-gradient(90deg,#8b5cf6,#ec4899,#f97316);padding:2px;border-radius:16px 16px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#111111;padding:28px 32px;border-radius:14px 14px 0 0;">
                    <p style="margin:0 0 6px 0;font-size:11px;color:#a1a1aa;letter-spacing:0.1em;text-transform:uppercase;">Commodities Analytics</p>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Alerta de Mercado</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td style="background:#111111;border-left:1px solid #333333;border-right:1px solid #333333;padding:28px 32px;">

              <!-- Badge commodity -->
              <p style="margin:0 0 20px 0;">
                <span style="display:inline-block;background:rgba(217,70,239,0.12);color:#d946ef;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 12px;border-radius:9999px;border:1px solid rgba(217,70,239,0.3);">${alerta.materia_prima.nome}</span>
              </p>

              <p style="margin:0 0 24px 0;font-size:15px;color:#a1a1aa;line-height:1.5;">
                A condição do seu alerta foi atendida. Confira os detalhes abaixo.
              </p>

              <!-- Métricas -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #333333;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #333333;background:#0a0a0a;">
                    <p style="margin:0 0 2px 0;font-size:11px;color:#a1a1aa;letter-spacing:0.05em;text-transform:uppercase;">Preço Atual</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">R$ ${preco_atual_referencia.toFixed(2)}</p>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #333333;border-left:1px solid #333333;background:#0a0a0a;">
                    <p style="margin:0 0 2px 0;font-size:11px;color:#a1a1aa;letter-spacing:0.05em;text-transform:uppercase;">Variação</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:${variacaoColor};letter-spacing:-0.02em;">${variacaoSinal}${variacao_percentual.toFixed(2)}%</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:14px 20px;background:#111111;">
                    <p style="margin:0 0 6px 0;font-size:11px;color:#a1a1aa;letter-spacing:0.05em;text-transform:uppercase;">Recomendação</p>
                    <span style="display:inline-block;background:${classificacaoBg};color:${classificacaoColor};font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:4px 14px;border-radius:9999px;">${classificacao_compra}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:14px 20px;border-top:1px solid #333333;background:#0a0a0a;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#a1a1aa;letter-spacing:0.05em;text-transform:uppercase;">Condição Monitorada</p>
                    <p style="margin:0;font-size:13px;color:#ffffff;">${alerta.tipo_alerta.replace(/_/g, ' ')} ${limiteFormatado}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(90deg,#8b5cf6,#ec4899,#f97316);padding:1px;border-radius:0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#0a0a0a;padding:16px 32px;border-radius:0 0 14px 14px;">
                    <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
                      Você recebeu este email porque configurou um alerta no Commodities Analytics.<br>
                      Acesse o painel para gerenciar seus alertas.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        let statusEnvio = 'enviado';
        let erroEnvio: string | null = null;

        if (!alerta.usuario.telefone_opcional && canal !== 'email') {
          statusEnvio = 'falha';
          erroEnvio = 'Usuário não possui telefone/chatId cadastrado no sistema';
          this.logger.warn(
            `User ${alerta.usuario.nome} lacks phone/chatId. Alert delivery failed.`,
          );
        } else {
          try {
            if (canal === 'telegram') {
              const success = await this.telegramService.sendMessage(
                alerta.usuario.telefone_opcional!,
                mensagem,
              );
              if (!success) {
                statusEnvio = 'falha';
                erroEnvio = 'Falha no envio da API do Telegram';
              }
            } else if (canal === 'email') {
              const success = await this.emailService.sendMessage(
                alerta.usuario.email,
                titulo,
                mensagemHtml,
              );
              if (!success) {
                statusEnvio = 'falha';
                erroEnvio = 'Falha no envio do email';
              }
            } else {
              this.logger.warn(
                `Canal de notificação desconhecido: ${canal}. Notificação não enviada.`,
              );
              statusEnvio = 'falha';
              erroEnvio = `Canal desconhecido: ${canal}`;
            }
          } catch (err) {
            statusEnvio = 'falha';
            erroEnvio = err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(`Error sending message: ${erroEnvio}`);
          }
        }

        await this.prisma.notificacao.create({
          data: {
            id_alerta: alerta.id_alerta,
            id_usuario: alerta.id_usuario,
            canal_envio: canal,
            titulo,
            mensagem: mensagem,
            status_envio: statusEnvio,
            erro_envio_opcional: erroEnvio,
            enviado_em: statusEnvio === 'enviado' ? new Date() : null,
          },
        });
      }
    }
  }
}
