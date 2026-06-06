import { apiClient } from "@/lib/api-client";

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// Commodity types and data have been moved to the backend.
// Use `@/services/commodities` for commodity-related fetches.
// ──────────────────────────────────────────────────────────────────────────────

export interface AlertModel {
  id: string;
  commodityName: string;
  condition: string;
  channel: string;
  active: boolean;
}

export async function getAlerts(): Promise<AlertModel[]> {
  return apiClient.get<AlertModel[]>('/alerts', {
    cache: 'no-store',
  });
}

export interface CreateAlertDto {
  commodityId: number;
  condition: 'Abaixo' | 'Acima' | 'bom';
  targetPrice?: number;
  channel: 'Telegram' | 'WhatsApp' | 'E-mail';
}

export async function createAlert(alert: CreateAlertDto): Promise<void> {
  return apiClient.post('/alerts', alert);
}

export async function toggleAlertStatus(id: string): Promise<void> {
  return apiClient.patch(`/alerts/${id}/toggle`);
}

export async function deleteAlert(id: string): Promise<void> {
  return apiClient.delete(`/alerts/${id}`);
}
