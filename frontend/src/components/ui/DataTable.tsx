import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Box,
  TablePagination,
  Typography,
  Checkbox,
} from "@mui/material";
import { Edit, Delete, ArrowUpward, ArrowDownward} from "@mui/icons-material";
import CountryFlag from "react-country-flag";
import { COUNTRY_MAP } from "../../utils/countryMap";
import React, { useState } from "react";

interface DataTableProps {
  data: any[];
  columns: { field: string; headerName: string }[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  page?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  rowsPerPage?: number;
  multiSelectMode?: boolean;
  selectedRows?: any[];
  toggleSelectRow?: (id: any) => void;
  toggleSelectAll?: () => void;
  cancelMultiSelect?: () => void;
  confirmMultiDelete?: () => void;
}

const formatDate = (date: any): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const calculateAge = (birthDate: any): number | null => {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age;
};

const getAgeSuffix = (age: number): string => {
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "л.";
  if (lastDigit >= 1 && lastDigit <= 4) return "г.";
  return "л.";
};

export const getCountryCode = (countryRu: string): string => {
  if (!countryRu) return "";
  const key = countryRu.trim();
  return COUNTRY_MAP[key] || "";
};

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  page = 0,
  onPageChange,
  rowsPerPage = 10,
  multiSelectMode = false,
  selectedRows = [],
  toggleSelectRow,
  toggleSelectAll

}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const totalRows = data.length;
  const startRow = totalRows === 0 ? 0 : page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalRows);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });
  }, [data, sortField, sortOrder]);

  const paginatedData = React.useMemo(() => {
    return sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  return (
    <Box>
      {totalRows > 0 && (
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
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    sx={{ color: "white" }}
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
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow key={row.id || index} selected={selectedRows.includes(row.id)}>
                  {multiSelectMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow?.(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => {
                    const value = row[col.field];
                    const isDateField = col.field.includes("date") || col.field.includes("_at");
                    const isNationalityField = col.field === "country";
                    const isBirthDateField = col.field === "birthdate";

                    return (
                      <TableCell key={col.field}>
                        {isBirthDateField ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2">{formatDate(value)}</Typography>
                            {value && (() => {
                              const age = calculateAge(value);
                              return age !== null ? (
                                <Typography sx={{ fontSize: "0.85em", color: "#666" }}>
                                  {age} {getAgeSuffix(age)}
                                </Typography>
                              ) : null;
                            })()}
                          </Box>
                        ) : isNationalityField ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {value && getCountryCode(value) && (
                              <CountryFlag
                                countryCode={getCountryCode(value)}
                                svg
                                style={{ width: "1.5em", height: "1.5em" }}
                                title={value}
                              />
                            )}
                            <Typography variant="body2">{value ?? "-"}</Typography>
                          </Box>
                        ) : isDateField ? (
                          formatDate(value)
                        ) : col.field === "sex" ? (
                          value ? "М" : "Ж"
                        ) : (
                          value ?? "-"
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      {!multiSelectMode && onEdit && (
                        <IconButton size="small" onClick={() => onEdit(row)} color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {!multiSelectMode && onDelete && (
                        <IconButton size="small" onClick={() => onDelete(row)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
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

        {totalRows > 0 && onPageChange && (
          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        )}
      </Paper>
    </Box>
  );
};
