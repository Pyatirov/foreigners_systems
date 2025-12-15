import { Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import CountryFlag from "react-country-flag";
import type { EntityFilter } from "../../types/entities";
import { COUNTRY_MAP } from "../../utils/countryMap";

interface FiltersFormProps<T> {
  open: boolean;
  filters: EntityFilter<T>[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const FiltersForm = <T extends Record<string, any>>({
  open,
  filters,
  values,
  onChange,
  onApply,
  onReset,
  onClose,
}: FiltersFormProps<T>) => {
  const getCountryCode = (countryRu: string) => {
    if (!countryRu) return "";
    const key = countryRu.trim();
    return COUNTRY_MAP[key] || "";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Фильтры</DialogTitle>
      <DialogContent>
        {filters.map((filter) => {
          const value = values[filter.field as string] ?? "";

          // Фильтр по строке
          if (filter.type === "string") {
            return (
              <TextField
                key={String(filter.field)}
                label={filter.label}
                fullWidth
                margin="normal"
                value={value}
                onChange={(e) => onChange(filter.field as string, e.target.value)}
              />
            );
          }

          // Фильтр по select
          if (filter.type === "select") {
            return (
              <TextField
                key={String(filter.field)}
                select
                label={filter.label}
                fullWidth
                margin="normal"
                value={value}
                onChange={(e) => onChange(filter.field as string, e.target.value)}
              >
                {filter.options?.map((opt) => {
                  const val = typeof opt === "string" ? opt : opt.value;
                  const label = typeof opt === "string" ? opt : opt.label;

                  // Если это поле страны — показываем флаг
                  const countryCode = filter.field === "country" ? getCountryCode(label) : "";

                  return (
                    <MenuItem key={String(val)} value={val}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {countryCode && (
                          <CountryFlag
                            countryCode={countryCode}
                            svg
                            style={{ width: "1.5em", height: "1.5em" }}
                            title={label}
                          />
                        )}
                        <Typography>{label}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            );
          }

          return null;
        })}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 1 }}>
        <Button onClick={onReset}>Сбросить все</Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>Отмена</Button>
          <Button variant="contained" onClick={onApply}>Применить</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
