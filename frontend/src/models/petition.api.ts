import { api } from "../api/axios";
import type { TPetition }  from "./petition.interface";

export const getPetitions = (): Promise<TPetition[]> =>
  api.get<TPetition[]>("/petitions").then(res => res.data);

export const getPetitionById = (id: string): Promise<TPetition> =>
  api.get<TPetition>(`/petitions/${id}`).then(res => res.data);

export const createPetition = (data: FormData | TPetition): Promise<TPetition> =>
  api.post<TPetition>("/petitions", data).then(res => res.data);

export const updatePetition = (id: string, data: FormData | TPetition): Promise<TPetition> =>
  api.patch<TPetition>(`/petitions/${id}`, data).then(res => res.data);

export const deletePetition = (id: string): Promise<void> =>
  api.delete(`/petitions/${id}`).then(() => {});