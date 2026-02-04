import { api } from "./axios";
import type { TPassport } from "../types/passport";

export const getPassports = (): Promise<TPassport[]> =>
  api.get<TPassport[]>("/passports").then(res => res.data);

export const getPassportById = (id: string): Promise<TPassport> =>
  api.get<TPassport>(`/passports/${id}`).then(res => res.data);

export const createPassport = (data: FormData | TPassport): Promise<TPassport> =>
  api.post<TPassport>("/passports", data).then(res => res.data);

export const updatePassport = (id: string, data: FormData | TPassport): Promise<TPassport> =>
  api.patch<TPassport>(`/passports/${id}`, data).then(res => res.data);

export const deletePassport = (id: string): Promise<void> =>
  api.delete(`/passports/${id}`).then(() => {});