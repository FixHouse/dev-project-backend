import axios from "axios";
import { tokenStorage } from "../auth/token.storage";

export const api = axios.create({
  baseURL: "http://192.168.0.87:3000",
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
