export interface EntityConfig<T> {
  title: string;
  endpoint: string;
  columns: { field: keyof T; headerName: string }[];
  fields: EntityField<T>[];
  filters?: EntityFilter<T>[];
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

