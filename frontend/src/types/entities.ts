export type Entity = Record<string, any>;

export interface EntityConfig<T extends Entity> {
  title: string;
  endpoint: string;
  columns: { field: keyof T; headerName: string }[];
  fields: EntityField<T>[];
  api: EntityApi<T>;
  filters?: EntityFilter<T>[];
}

export interface EntityApi<T extends Entity> {
  getAll: (params?: Record<string, string | number>) => Promise<{ items: T[]; total: number }>;
  getById: (id: string) => Promise<T>;
  create: (data: FormData | T) => Promise<T>;
  update: (id: string, data: FormData | T) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export interface EntityField<T extends Entity = Entity> {
  name: keyof T;
  label: string;
  type: "string" | "number" | "date" | "select" | "photo";
  required?: boolean;
  options?: { label: string; value: any }[];
}

export type SelectOption = string | { value: string; label: string };

export type EntityFilter<T extends Entity> =
  | { field: keyof T; label: string; type: "string" }
  | { field: keyof T; label: string; type: "select"; options: SelectOption[] };