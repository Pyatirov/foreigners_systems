export interface DataTableProps {
  data: any[];  // массив объектов с данными для отображения
  columns: { field: string; headerName: string }[]; // описание колонок: field - имя поля в данных, headerName - отображаемое название
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  page?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowClick?: (row: any) => void;
  rowsPerPage?: number;
  totalRows?: number;
  multiSelectMode?: boolean;
  selectedRows?: any[];
  toggleSelectRow?: (id: any) => void;
  toggleSelectAll?: () => void;
  cancelMultiSelect?: () => void;
  confirmMultiDelete?: () => void;
}