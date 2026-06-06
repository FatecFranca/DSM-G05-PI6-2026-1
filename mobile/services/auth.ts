import { apiClient } from "../lib/api-client";

export const login = async (email: string, password: string) => {
  const response = await apiClient.post<{ accessToken: string; user: any }>('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, phone: string) => {
  const response = await apiClient.post<{ accessToken: string; user: any }>('/auth/register', { name, email, password, phone });
  return response.data;
};
