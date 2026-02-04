export interface EntityConfig<T> {
  title: string;
  endpoint: string;
  columns: { field: keyof T; headerName: string }[];
  fields: EntityField<T>[];
  api: EntityApi<T>;
  filters?: EntityFilter<T>[];
}

export interface EntityApi<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: FormData | T) => Promise<T>;
  update: (id: string, data: FormData | T) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export interface EntityField<T = any> {
  name: keyof T;
  label: string;
  type: 'string' | 'number' | 'date' | 'select' | 'photo';
  required?: boolean;
  options?: {label: string; value: any; }[];
}

export type FilterType = "string" | "select" | "dateRange";

export type SelectOption =
  | string
  | { value: string; label: string };

export type EntityFilter<T> =
  | {
      field: keyof T;
      label: string;
      type: "string";
    }
  | {
      field: keyof T;
      label: string;
      type: "select";
      options: SelectOption[];
    };

