import { apiClient } from "@/lib/api-client";

export const login = async (email: string, password: string) => {
  return apiClient.post<{ accessToken: string; user: any }>('/auth/login', { email, password });
};

export const register = async (name: string, email: string, password: string, phone: string) => {
  return apiClient.post<{ accessToken: string; user: any }>('/auth/register', { name, email, password, phone });
};
