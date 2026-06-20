import { CountryCell } from "../CountryCell/CountryCell";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { formatUserRole } from "../../../constants/roles";

/** DD.MM.YYYY — календарные даты (рождение, выдача визы и т.п.) */
export const formatDate = (date: unknown): string => {
  if (!date) return "-";
  const d = dayjs(date);
  if (!d.isValid()) return "-";
  return d.format("DD.MM.YYYY");
};

/** DD.MM.YYYY HH:mm:ss — дата регистрации, сроки действия и т.п. */
export const formatDateTime = (date: unknown): string => {
  if (!date) return "-";
  const d = dayjs(date);
  if (!d.isValid()) return "-";
  return d.format("DD.MM.YYYY HH:mm:ss");
};

const isDateTimeField = (field: string) =>
  field.endsWith("At") ||
  field.endsWith("_at") ||
  field === "valid_from" ||
  field === "valid_to";

export const calculateAge = (birthDate: any): number | null => {
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

export const getAgeSuffix = (age: number): string => {
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "л.";
  if (lastDigit >= 1 && lastDigit <= 4) return "г.";
  return "л.";
};

export const sortData = (
  data: any[],
  field: string | null,
  order: "asc" | "desc"
): any[] => {
  if (!field) return data;
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "string" && typeof bVal === "string")
      return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return order === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });
};

export const renderCell = (field: string, value: any): React.ReactNode => {
  if (field === "photoUrl") {
    return value
      ? <Box component="img" src={value.startsWith("http") ? value : `http://localhost:5000${value}`} alt="Photo" sx={{ width: 50, height: 50, borderRadius: 1, objectFit: "cover" }} />
      : "-";
  }

  if (field === "birthdate") {
    const age = calculateAge(value);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2">{formatDate(value)}</Typography>
        {age !== null && (
          <Typography sx={{ fontSize: "0.85em", color: "#666" }}>
            {age} {getAgeSuffix(age)}
          </Typography>
        )}
      </Box>
    );
  }

  if (field === "country") return <CountryCell value={value} />;
  if (field === "role") return formatUserRole(value);
  if (field === "sex") return value ? "М" : "Ж";
  if (isDateTimeField(field)) return formatDateTime(value);
  if (field.includes("date")) return formatDate(value);

  return value ?? "-";
};