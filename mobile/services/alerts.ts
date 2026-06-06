import { apiClient } from "../lib/api-client";

export interface AlertModel {
  id: string;
  commodityName: string;
  condition: string;
  channel: string;
  active: boolean;
}

export async function getAlerts(): Promise<AlertModel[]> {
  const response = await apiClient.get<AlertModel[]>('/alerts');
  return response.data;
}

export interface CreateAlertDto {
  commodityId: number;
  condition: 'Abaixo' | 'Acima' | 'bom';
  targetPrice?: number;
  channel: 'Telegram' | 'E-mail';
}

export async function createAlert(alert: CreateAlertDto): Promise<void> {
  await apiClient.post('/alerts', alert);
}

export async function toggleAlertStatus(id: string): Promise<void> {
  await apiClient.patch(`/alerts/${id}/toggle`);
}

export async function deleteAlert(id: string): Promise<void> {
  await apiClient.delete(`/alerts/${id}`);
}
