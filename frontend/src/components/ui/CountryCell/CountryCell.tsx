import CountryFlag from "react-country-flag";
import { Box, Typography } from "@mui/material";
import { COUNTRY_MAP } from "../../../utils/countryMap";
import type { CountryCellProps } from "./CountryCell.types";

export const getCountryCode = (countryRu: string): string =>
  COUNTRY_MAP[countryRu?.trim()] || "";

export const CountryCell = ( {value}: CountryCellProps ) => {
  const code = getCountryCode(value);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {value && code && (
        <CountryFlag countryCode={code} svg style={{ width: "1.5em", height: "1.5em" }} title={value} />
      )}
      <Typography variant="body2">{value ?? "-"}</Typography>
    </Box>
  );
};