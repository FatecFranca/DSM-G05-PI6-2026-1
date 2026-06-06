import { apiClient } from "../lib/api-client";

export type Enterprise = {
  id: number;
  enterprise_name: string;
  cnpj: string;
  address: string;
  cep: string;
  email: string;
  phone: string;
  type: string[];
};

export async function getEnterprises(): Promise<Enterprise[]> {
  const response = await apiClient.get<Enterprise[]>('/enterprises');
  return response.data;
}
