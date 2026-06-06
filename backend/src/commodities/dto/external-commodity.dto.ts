/**
 * Representa um item retornado pela rota GET /api/v1/commodities da API externa.
 */
export interface ExternalCommodityItem {
  id_materia_prima: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  ativo: boolean;
}

/**
 * Payload de request para POST /api/v1/classify da API externa.
 * Aceita string | number pois a API externa pode trabalhar com ambos.
 */
export interface ClassifyRequest {
  id_materia_prima: string | number;
}

/**
 * Resposta de POST /api/v1/classify da API externa.
 */
export interface ClassifyResponse {
  id_materia_prima: string;
  nome: string;
  preco_atual: number;
  previsao_media_futura: number;
  variacao_percentual: number;
  classificacao: string;
  justificativa: string;
}

/**
 * Payload serializado que o nosso backend retorna ao frontend para a listagem.
 */
export interface CommodityResponseDto {
  id: string;
  name: string;
  actual_price: number;
  variation_percentage: number;
  classification: string;
}

// ─── Interfaces para GET /api/v1/commodities/{id}/history ──────────────────

export interface HistoryItem {
  data_referencia: string;
  preco_medio: number;
  fonte_dado?: string;
  regiao?: string;
}

export interface HistoryResponse {
  id_materia_prima: string;
  nome: string;
  historico: HistoryItem[];
}

// ─── Interfaces para POST /api/v1/predict ──────────────────────────────────

export interface PredictRequest {
  id_materia_prima: string | number;
  periodos_futuros: number;
}

export interface ForecastItem {
  periodo: string;
  preco_previsto: number;
  variacao_pct: number;
}

export interface PredictResponse {
  id_materia_prima: string | number;
  nome: string;
  previsoes: ForecastItem[];
  modelo_utilizado: string;
  data_geracao: string;
}

// ─── DTO final retornado ao frontend na rota GET /commodities/:id ───────────

export interface CommodityDetailDto {
  nome: string;
  id_materia_prima: string;
  preco_atual: number;
  previsao_media_futura: number;
  classificacao: string;
  variacao_percentual: number;
  justificativa: string;
  modelo_utilizado: string;
  data_geracao: string;
  historico: HistoryItem[];
  previsoes: ForecastItem[];
}
