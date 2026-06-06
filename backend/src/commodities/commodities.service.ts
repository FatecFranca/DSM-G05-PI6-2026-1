import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalCommodityItem,
  ClassifyRequest,
  ClassifyResponse,
  CommodityResponseDto,
  HistoryResponse,
  PredictRequest,
  PredictResponse,
  CommodityDetailDto,
} from './dto/external-commodity.dto';
@Injectable()
export class CommoditiesService {
  private readonly logger = new Logger(CommoditiesService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Busca todas as commodities na API externa, classifica cada uma via /api/v1/classify
   * e retorna o payload serializado para o frontend.
   */
  async findAll(): Promise<CommodityResponseDto[]> {

    const baseUrl = this.configService.get<string>('EXTERNAL_API_URL');

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'EXTERNAL_API_URL não configurada. Verifique o .env do backend.',
      );
    }

    // 1. Buscar lista de commodities na API externa
    let rawCommodities: ExternalCommodityItem[];
    try {
      const response = await fetch(`${baseUrl}/api/v1/commodities`);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      rawCommodities = (await response.json()) as ExternalCommodityItem[];
    } catch (err) {
      this.logger.error('Erro ao buscar commodities da API externa', err);
      throw new InternalServerErrorException(
        'Falha ao buscar lista de commodities da API externa.',
      );
    }

    // 2. Para cada commodity ativa, chamar /api/v1/classify em paralelo
    const activeItems = rawCommodities.filter((c) => c.ativo);

    const classifications = await Promise.all(
      activeItems.map(async (item): Promise<CommodityResponseDto | null> => {
        // Garantir que o id seja string para consistência com o contrato do frontend
        const idStr = String(item.id_materia_prima);
        const body: ClassifyRequest = {
          id_materia_prima: idStr,
        };

        try {
          const classifyResponse = await fetch(`${baseUrl}/api/v1/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!classifyResponse.ok) {
            this.logger.warn(
              `Classify retornou ${classifyResponse.status} para ${idStr}`,
            );
            return null;
          }

          const data = (await classifyResponse.json()) as ClassifyResponse;

          // 3. Serializar para o contrato do frontend
          // IMPORTANTE: forçar toString() no id pois a API externa retorna number,
          // mas o frontend usa === para comparar com o value do <select> (sempre string)
          return {
            id: String(data.id_materia_prima),
            name: data.nome,
            actual_price: data.preco_atual,
            variation_percentage: data.variacao_percentual,
            classification: data.classificacao,
          };
        } catch (err) {
          this.logger.warn(
            `Erro ao classificar commodity ${idStr}`,
            err,
          );
          return null;
        }
      }),
    );

    // Filtrar nulos (commodities que falharam na classificação)
    return classifications.filter(
      (c): c is CommodityResponseDto => c !== null,
    );
  }

  /**
   * Busca uma commodity por ID, agregando dados de histórico, classificação e previsões.
   *
   * Orquestra 3 chamadas à API externa em paralelo:
   *  1. GET  /api/v1/commodities/{id}/history  → histórico de preços
   *  2. POST /api/v1/classify                  → classificação e preço atual
   *  3. POST /api/v1/predict                   → previsões futuras
   *
   * Enquanto a API externa não está disponível, os dados são retornados via mock.
   */
  async findById(id: string): Promise<CommodityDetailDto> {
    // ── Implementação real (ativar quando API externa estiver disponível) ────
    const baseUrl = this.configService.get<string>('EXTERNAL_API_URL');

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'EXTERNAL_API_URL não configurada. Verifique o .env do backend.',
      );
    }

    // Garantir que o id seja string normalizada antes de passar para a API externa
    const normalizedId = String(id);
    const classifyBody: ClassifyRequest = { id_materia_prima: normalizedId };
    const predictBody: PredictRequest = { id_materia_prima: normalizedId, periodos_futuros: 3 };

    const [historyRes, classifyRes, predictRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/commodities/${normalizedId}/history`),
      fetch(`${baseUrl}/api/v1/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classifyBody),
      }),
      fetch(`${baseUrl}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictBody),
      }),
    ]);

    if (!historyRes.ok || !classifyRes.ok || !predictRes.ok) {
      this.logger.error(
        `Falha em uma das chamadas externas para "${id}": ` +
          `history=${historyRes.status}, classify=${classifyRes.status}, predict=${predictRes.status}`,
      );
      throw new InternalServerErrorException(
        `Falha ao buscar dados completos para a commodity "${id}".`,
      );
    }

    const [history, classify, predict] = await Promise.all([
      historyRes.json() as Promise<HistoryResponse>,
      classifyRes.json() as Promise<ClassifyResponse>,
      predictRes.json() as Promise<PredictResponse>,
    ]);

    return {
      nome: classify.nome,
      // Forçar string para manter consistência com o contrato do frontend
      id_materia_prima: String(classify.id_materia_prima),
      preco_atual: classify.preco_atual,
      previsao_media_futura: classify.previsao_media_futura,
      variacao_percentual: classify.variacao_percentual,
      classificacao: classify.classificacao,
      justificativa: classify.justificativa,
      modelo_utilizado: predict.modelo_utilizado,
      data_geracao: predict.data_geracao,
      historico: history.historico,
      previsoes: predict.previsoes,
    };
  }
}
