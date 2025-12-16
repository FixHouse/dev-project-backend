import { api } from "../api/axios";

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: "READER" | "AUTHOR";
};

export const authService = {
  login: async (dto: LoginRequest) => {
    const { data } = await api.post<LoginResponse>("/auth/login", dto);
    return data;
  },

  me: async () => {
    const { data } = await api.get<MeResponse>("/auth/me");
    return data;
  },
};
