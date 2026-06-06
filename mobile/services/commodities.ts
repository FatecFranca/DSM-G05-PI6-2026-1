import { apiClient } from "../lib/api-client";

export type Classification = 'bom' | 'regular' | 'ruim' | string;

export interface Commodity {
  id: string;
  name: string;
  actual_price: number;
  variation_percentage: number;
  classification: Classification;
}

export interface HistoryItem {
  data_referencia: string;
  preco_medio: number;
  fonte_dado?: string;
  regiao?: string;
}

export interface ForecastItem {
  periodo: string;
  preco_previsto: number;
  variacao_pct: number;
}

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

export async function getCommodities(): Promise<Commodity[]> {
  const response = await apiClient.get<Commodity[]>('/commodities');
  return response.data;
}

export async function getCommodityById(id: string): Promise<CommodityDetail | undefined> {
  try {
    const response = await apiClient.get<CommodityDetail>(`/commodities/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('404') || error.status === 404) return undefined;
    throw error;
  }
}
