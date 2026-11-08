import { authApi } from "./axios";
import {
  setAccessToken,
  clearAccessToken,
} from "../store/auth.store";

export const loginRequest = async (data: {
  email: string;
  password: string;
}) => {
  const { data: response } = await authApi.post(
    "/auth/login",
    data
  );

  if (!response.accessToken) {
    throw new Error("Сервер не вернул accessToken");
  }

  setAccessToken(response.accessToken);

  return response.accessToken;
};

export const registerRequest = async (data: {
  email: string;
  password: string;
}) => {
  const { data: response } = await authApi.post(
    "/auth/register",
    data
  );

  return response;
};

export const logoutRequest = async () => {
  try {
    await authApi.post("/auth/logout", {});
  } finally {
    clearAccessToken();
  }
};

export const refreshRequest = async () => {
  const { data } = await authApi.post("/auth/refresh");

  if (!data.accessToken) {
    throw new Error("Сервер не вернул accessToken");
  }

  setAccessToken(data.accessToken);

  return data.accessToken;
};