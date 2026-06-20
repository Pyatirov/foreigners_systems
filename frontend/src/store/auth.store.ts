// auth.store.ts
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

let accessToken: string | null = null;
let currentUser: TokenPayload | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
  currentUser = jwtDecode<TokenPayload>(token); // декодируем сразу при сохранении
}

export function getAccessToken() {
  return accessToken;
}

export function getCurrentUser() {
  return currentUser;
}

export function clearAccessToken() {
  accessToken = null;
  currentUser = null;
}