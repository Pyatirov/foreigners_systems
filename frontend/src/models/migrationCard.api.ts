import { api } from "../api/axios";
import type { TMigrationCard } from "./migrationCard.interface";

export const getMigrationCards = (): Promise<TMigrationCard[]> =>
  api.get<TMigrationCard[]>("/migration_cards").then(res => res.data);

export const getMigrationCardById = (id: string): Promise<TMigrationCard> =>
  api.get<TMigrationCard>(`/migration_cards/${id}`).then(res => res.data); 

export const createMigrationCard = (data: FormData | TMigrationCard): Promise<TMigrationCard> =>
  api.post<TMigrationCard>("/migration_cards", data).then(res => res.data);

export const updateMigrationCard = (id: string, data: FormData | TMigrationCard): Promise<TMigrationCard> =>
  api.patch<TMigrationCard>(`/migration_cards/${id}`, data).then(res => res.data);

export const deleteMigrationCard = (id: string): Promise<void> =>
  api.delete(`/migration_cards/${id}`).then(() => {});