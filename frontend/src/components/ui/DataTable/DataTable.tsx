import React, { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Box, TablePagination, Typography, Checkbox } from "@mui/material";
import { ArrowUpward, ArrowDownward} from "@mui/icons-material";
import { TableContextMenu } from "../TableContextMenu";
import type { DataTableProps } from "./DataTable.types";
import { renderCell, sortData } from "./DataTable.utils";
import { ROWS_PER_PAGE } from "../../../constants/index";

export const DataTable =({
  data,
  columns,
  onEdit,
  onDelete,
  page = 0,
  onPageChange,
  rowsPerPage = ROWS_PER_PAGE,
  totalRows,
  multiSelectMode = false,
  selectedRows = [],
  toggleSelectRow,
  toggleSelectAll,
  onRowClick

} : DataTableProps) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    row: any;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, row });
  };

  const startRow = totalRows === 0 ? 0 : page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalRows ?? 0);

  const pageIds = data.map(row => row._id ?? row.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedRows.includes(id));

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    setSortField(prev => {
      if (prev === field) return field;
      return field;
    });
    setSortOrder(prev => sortField === field && prev === "asc" ? "desc" : "asc");
  };

  const sortedData = React.useMemo(
    () => sortData(data, sortField, sortOrder),
    [data, sortField, sortOrder]
  );

  return (
    <Box>
      {(totalRows ?? 0) > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Отображено {startRow}–{endRow} из {totalRows}
          </Typography>
        </Box>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              {multiSelectMode && (
                <TableCell sx={{ color: "white" }}>
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={pageIds.some(id => selectedRows.includes(id)) && !allPageSelected}
                    onClick={e => {
                      e.stopPropagation();
                      toggleSelectAll?.();
                    }}
                    sx={{
                      color: "white",
                      "&.Mui-checked": { color: "white" },
                      "&.MuiCheckbox-indeterminate": { color: "white" },
                    }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    userSelect: "none",
                    position: "relative",
                    "&:hover .sort-arrow": { opacity: 1 },
                  }}
                  onClick={() => handleSort(col.field)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {col.headerName}
                    <Box
                      className="sort-arrow"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        ml: 0.5,
                        opacity: sortField === col.field ? 1 : 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <ArrowUpward
                        sx={{
                          fontSize: "1.2em",
                          color: sortField === col.field && sortOrder === "asc" ? "white" : "rgba(255,255,255,0.5)",
                        }}
                      />
                      <ArrowDownward
                        sx={{
                          fontSize: "1.2em",
                          color: sortField === col.field && sortOrder === "desc" ? "white" : "rgba(255,255,255,0.5)",
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => (
                <TableRow 
                  key={row._id || index} 
                  selected={selectedRows.includes(row._id)} 
                  onClick={() => {                          // ← меняем этот onClick
                    if (multiSelectMode) {
                      toggleSelectRow?.(row._id);           // мультивыбор — отмечаем
                    } else {
                      onRowClick?.(row);                    // обычный режим — карточка
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, row)} 
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: "secondary.main",
                      transition: "0.3s ease",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "secondary.main", // ← тот же цвет что и hover
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "secondary.main", // ← чтобы не сбрасывался при наведении на выделенную
                    },
                  }}
                >
                  {multiSelectMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row._id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectRow?.(row._id)
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {renderCell(col.field, row[col.field])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (multiSelectMode ? 2 : 1)} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">Данные не найдены</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {(totalRows ?? 0) && onPageChange && (
          <TablePagination
            rowsPerPageOptions={[ROWS_PER_PAGE]}
            component="div"
            count={totalRows ?? 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
      )}
      </Paper>
      <TableContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Box>
  );
};