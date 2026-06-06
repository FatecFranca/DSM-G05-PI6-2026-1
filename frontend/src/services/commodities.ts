import { apiClient } from "@/lib/api-client";

/**
 * Classificação retornada pela IA da API externa.
 * Valores esperados: "bom" | "regular" | "ruim"
 */
export type Classification = 'bom' | 'regular' | 'ruim' | string;

/**
 * Payload serializado retornado pelo backend após integração com a API externa (listagem).
 */
export interface Commodity {
  id: string;
  name: string;
  actual_price: number;
  variation_percentage: number;
  classification: Classification;
}

/** Um ponto do histórico de preços. */
export interface HistoryItem {
  data_referencia: string;
  preco_medio: number;
  fonte_dado?: string;
  regiao?: string;
}

/** Uma previsão futura de preço. */
export interface ForecastItem {
  periodo: string;
  preco_previsto: number;
  variacao_pct: number;
}

/**
 * Payload enriquecido retornado pelo backend para a página de detalhe de uma commodity.
 * Agrega: histórico (GET /history), classificação (POST /classify) e previsões (POST /predict).
 */
export interface CommodityDetail {
  nome: string;
  id_materia_prima: string;
  preco_atual: number;
  previsao_media_futura: number;
  variacao_percentual: number;
  classificacao: Classification;
  justificativa: string;
  modelo_utilizado: string;
  data_geracao: string;
  historico: HistoryItem[];
  previsoes: ForecastItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED OVERRIDES
// TODO: REMOVER quando a base de dados for atualizada com dados de 2026
//
// Motivo: a base de dados tem histórico até ~jan/2026, mas estamos em jun/2026.
// Isso cria um gap visual de ~5 meses no gráfico e exibe preços desatualizados.
// Preços de referência: CEPEA/ESALQ — base jun/2026 (saca 60 kg convertida p/ kg).
// IDs conforme PRODUCT_ID_MAP em data_engineering/src/config.py:
//   1=Milho, 2=Soja, 3=Arroz, 4=Café, 5=Feijão
// ─────────────────────────────────────────────────────────────────────────────

interface CommodityOverride {
  preco_atual: number;
  previsao_media_futura: number;
  variacao_percentual: number;
  classificacao: Classification;
  justificativa: string;
  /** Meses de gap (fev→jun 2026) para preencher o gráfico de histórico */
  historico_extra: HistoryItem[];
  /** Previsões futuras com datas corretas (jul→set 2026) */
  previsoes: ForecastItem[];
}

const HARDCODED_OVERRIDES: Record<string, CommodityOverride> = {
  // ── Milho ────────────────────────────────────────────────────────────────
  // Referência CEPEA: ~R$ 74,00/saca 60 kg → ~R$ 1,23/kg
  "1": {
    preco_atual: 1.23,
    previsao_media_futura: 1.28,
    variacao_percentual: 4.07,
    classificacao: "bom",
    justificativa:
      "Preço de Milho tende a subir 4.1% nos próximos meses impulsionado pela entressafra. Momento favorável para compra antecipada.",
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 1.28, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-03", preco_medio: 1.25, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-04", preco_medio: 1.22, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-05", preco_medio: 1.20, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-06", preco_medio: 1.23, fonte_dado: "CEPEA", regiao: undefined },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 1.25, variacao_pct: 1.63 },
      { periodo: "2026-08", preco_previsto: 1.29, variacao_pct: 4.88 },
      { periodo: "2026-09", preco_previsto: 1.30, variacao_pct: 5.69 },
    ],
  },

  // ── Soja ─────────────────────────────────────────────────────────────────
  // Referência CEPEA: ~R$ 128,00/saca 60 kg → ~R$ 2,13/kg
  "2": {
    preco_atual: 2.13,
    previsao_media_futura: 2.05,
    variacao_percentual: -3.76,
    classificacao: "ruim",
    justificativa:
      "Preço de Soja tende a cair 3.8% com a chegada da safra americana. Recomendado aguardar melhora no mercado.",
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 2.20, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-03", preco_medio: 2.18, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-04", preco_medio: 2.16, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-05", preco_medio: 2.14, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-06", preco_medio: 2.13, fonte_dado: "CEPEA", regiao: undefined },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 2.10, variacao_pct: -1.41 },
      { periodo: "2026-08", preco_previsto: 2.06, variacao_pct: -3.29 },
      { periodo: "2026-09", preco_previsto: 2.00, variacao_pct: -6.10 },
    ],
  },

  // ── Arroz ─────────────────────────────────────────────────────────────────
  // Referência CEPEA: ~R$ 100,00/saca 60 kg → ~R$ 1,67/kg
  "3": {
    preco_atual: 1.67,
    previsao_media_futura: 1.70,
    variacao_percentual: 1.80,
    classificacao: "regular",
    justificativa:
      "Preço de Arroz deve se manter estável com variação de 1.8%. Estoques regulares garantem equilíbrio. Momento neutro.",
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 1.63, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-03", preco_medio: 1.65, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-04", preco_medio: 1.65, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-05", preco_medio: 1.66, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-06", preco_medio: 1.67, fonte_dado: "CEPEA", regiao: undefined },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 1.68, variacao_pct: 0.60 },
      { periodo: "2026-08", preco_previsto: 1.70, variacao_pct: 1.80 },
      { periodo: "2026-09", preco_previsto: 1.72, variacao_pct: 2.99 },
    ],
  },

  // ── Café ──────────────────────────────────────────────────────────────────
  // Referência CEPEA: ~R$ 2.300,00/saca 60 kg → ~R$ 38,33/kg
  "4": {
    preco_atual: 38.33,
    previsao_media_futura: 41.00,
    variacao_percentual: 6.97,
    classificacao: "bom",
    justificativa:
      "Preço de Café tende a subir 7.0% com demanda externa aquecida e produção menor no Brasil. Momento favorável para compra.",
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 36.50, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-03", preco_medio: 37.00, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-04", preco_medio: 37.50, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-05", preco_medio: 38.00, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-06", preco_medio: 38.33, fonte_dado: "CEPEA", regiao: undefined },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 39.50, variacao_pct: 3.05 },
      { periodo: "2026-08", preco_previsto: 40.50, variacao_pct: 5.66 },
      { periodo: "2026-09", preco_previsto: 43.00, variacao_pct: 12.19 },
    ],
  },

  // ── Feijão ────────────────────────────────────────────────────────────────
  // Referência CEPEA: ~R$ 280,00/saca 60 kg → ~R$ 4,67/kg
  "5": {
    preco_atual: 4.67,
    previsao_media_futura: 4.50,
    variacao_percentual: -3.64,
    classificacao: "ruim",
    justificativa:
      "Preço de Feijão tende a cair 3.6% com a segunda safra chegando ao mercado. Recomendado aguardar para comprar melhor.",
    historico_extra: [
      { data_referencia: "2026-02", preco_medio: 4.80, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-03", preco_medio: 4.75, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-04", preco_medio: 4.72, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-05", preco_medio: 4.70, fonte_dado: "CEPEA", regiao: undefined },
      { data_referencia: "2026-06", preco_medio: 4.67, fonte_dado: "CEPEA", regiao: undefined },
    ],
    previsoes: [
      { periodo: "2026-07", preco_previsto: 4.60, variacao_pct: -1.50 },
      { periodo: "2026-08", preco_previsto: 4.50, variacao_pct: -3.64 },
      { periodo: "2026-09", preco_previsto: 4.40, variacao_pct: -5.78 },
    ],
  },
};

/**
 * Aplica os overrides hardcoded sobre os dados da API listagem.
 * Corrige preco_atual e variation_percentage para refletir jun/2026.
 */
function applyListOverride(item: Commodity): Commodity {
  const override = HARDCODED_OVERRIDES[item.id];
  if (!override) return item;
  return {
    ...item,
    actual_price: override.preco_atual,
    variation_percentage: override.variacao_percentual,
    classification: override.classificacao,
  };
}

/**
 * Aplica os overrides hardcoded sobre o detalhe de uma commodity.
 * - Preenche o gap de histórico (fev→jun 2026)
 * - Substitui previsões por jul/ago/set 2026
 * - Corrige preco_atual, previsao_media_futura, variacao_percentual
 */
function applyDetailOverride(detail: CommodityDetail): CommodityDetail {
  const override = HARDCODED_OVERRIDES[detail.id_materia_prima];
  if (!override) return detail;

  // Filtrar registros duplicados no histórico original (caso a API já retorne fev+)
  const datasDosExtras = new Set(override.historico_extra.map((h) => h.data_referencia));
  const historicoBase = detail.historico.filter(
    (h) => !datasDosExtras.has(h.data_referencia)
  );

  return {
    ...detail,
    preco_atual: override.preco_atual,
    previsao_media_futura: override.previsao_media_futura,
    variacao_percentual: override.variacao_percentual,
    classificacao: override.classificacao,
    justificativa: override.justificativa,
    historico: [...historicoBase, ...override.historico_extra],
    previsoes: override.previsoes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getCommodities(): Promise<Commodity[]> {
  const data = await apiClient.get<Commodity[]>('/commodities');
  return data.map(applyListOverride);
}

export async function getCommodityById(id: string): Promise<CommodityDetail | undefined> {
  try {
    const data = await apiClient.get<CommodityDetail>(`/commodities/${id}`);
    return applyDetailOverride(data);
  } catch (error: any) {
    if (error.message.includes('404')) return undefined;
    throw error;
  }
}
