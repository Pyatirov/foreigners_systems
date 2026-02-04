import { api } from "./api";
import type { TStudent } from "../types/student";

export const getStudents = (): Promise<TStudent[]> =>
  api.get<TStudent[]>("/students").then(res => res.data);

export const getStudentById = (id: string): Promise<TStudent> =>
  api.get<TStudent>(`/students/${id}`).then(res => res.data);

export const createStudent = (data: FormData | TStudent): Promise<TStudent> =>
  api.post<TStudent>("/students", data).then(res => res.data);

export const updateStudent = (id: string, data: FormData | TStudent): Promise<TStudent> =>
  api.patch<TStudent>(`/students/${id}`, data).then(res => res.data);

export const deleteStudent = (id: string): Promise<void> =>
  api.delete(`/students/${id}`).then(() => {});
