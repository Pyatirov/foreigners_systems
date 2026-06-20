import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../store/auth.store";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Добавляем токен из памяти к каждому запросу
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// На 401 — обновляем токен и повторяем запрос один раз (кроме самого refresh)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isRefreshRequest = error.config?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !error.config._retry && !isRefreshRequest) {
      error.config._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        clearAccessToken();
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const loginRequest = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  setAccessToken(res.data.accessToken);
  return res.data.accessToken;
};

export const registerRequest = async (data: { email: string; password: string; role: string }) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const logoutRequest = async () => {
  await api.post("/auth/logout", {});
};

export const refreshRequest = async () => {
  const { data } = await api.post("/auth/refresh");
  return data.accessToken;
};