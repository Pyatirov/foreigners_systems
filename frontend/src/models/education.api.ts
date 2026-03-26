import { api } from "../api/axios";
import type { TEducation } from "./education.interface";

export const getEducation = (): Promise<TEducation[]> =>
  api.get<TEducation[]>("/education_documents").then(res => res.data);

export const getEducationById = (id: string): Promise<TEducation> =>
  api.get<TEducation>(`/education_documents/${id}`).then(res => res.data);

export const createEducation = (data: FormData | TEducation): Promise<TEducation> =>
  api.post<TEducation>("/education_documents", data).then(res => res.data);

export const updateEducation = (id: string, data: FormData | TEducation): Promise<TEducation> =>
  api.patch<TEducation>(`/education_documents/${id}`, data).then(res => res.data);

export const deleteEducation = (id: string): Promise<void> =>
  api.delete(`/education_documents/${id}`).then(() => {});