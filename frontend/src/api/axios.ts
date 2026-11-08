import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../store/auth.store";

// Адрес backend. Поддерживает VITE_API_URL как с /api, так и без него.
const configuredUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const API_ORIGIN = configuredUrl
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

// Все рабочие данные: студенты, документы, типы документов и т. д.
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
});

// Авторизация находится за пределами /api.
export const authApi = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
});

// Добавляем access token ко всем запросам к /api.
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// Не допускаем параллельного обновления одного refresh token.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = authApi
      .post<{ accessToken: string }>("/auth/refresh")
      .then(({ data }) => {
        if (!data.accessToken) {
          throw new Error("Сервер не вернул accessToken");
        }

        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// При 401 обновляем access token и повторяем исходный запрос один раз.
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();

      original.headers.Authorization = `Bearer ${token}`;

      return api(original);
    } catch (refreshError) {
      clearAccessToken();

      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }

      return Promise.reject(refreshError);
    }
  }
);