import { api } from "./axios";
import type { TVisa } from "../types/visa";

export const getVisas = (): Promise<TVisa[]> =>
  api.get<TVisa[]>("/visas").then(res => res.data);

export const getVisaById = (id: string): Promise<TVisa> =>
  api.get<TVisa>(`/visas/${id}`).then(res => res.data);

export const createVisa = (data: FormData | TVisa): Promise<TVisa> =>
  api.post<TVisa>("/visas", data).then(res => res.data);

export const updateVisa = (id: string, data: FormData | TVisa): Promise<TVisa> =>
  api.patch<TVisa>(`/visas/${id}`, data).then(res => res.data);

export const deleteVisa = (id: string): Promise<void> =>
  api.delete(`/visas/${id}`).then(() => {});