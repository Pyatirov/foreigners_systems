// auth.api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, 
});

export async function loginRequest(data: { email: string; password: string; }) {
  const res = await api.post("/auth/login", data, { withCredentials: true });
  return res.data.accessToken;
}

export async function registerRequest(data: { email: string; password: string }) {
  const res = await api.post("/auth/register", data, { withCredentials: true});
  return res.data
}

