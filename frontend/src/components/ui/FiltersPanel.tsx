import { Box, Button, TextField, MenuItem, Collapse } from "@mui/material";
import type{ EntityFilter } from "../../types/entities"

interface Props<T> {
  open: boolean;
  filters: EntityFilter<T>[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onApply: () => void;
}

export const FiltersPanel = <T extends Record<string, any>>({
  open,
  filters,
  values,
  onChange,
  onApply,
}: Props<T>) => {
  return (
    <Collapse in={open}>
      <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
        {filters.map((filter) => {
          const value = values[filter.field as string] ?? "";

          if (filter.type === "string") {
            return (
              <TextField
                key={String(filter.field)}
                label={filter.label}
                fullWidth
                margin="normal"
                value={value}
                onChange={(e) =>
                  onChange(filter.field as string, e.target.value)
                }
              />
            );
          }

          if (filter.type === "select") {
            return (
              <TextField
                key={String(filter.field)}
                select
                label={filter.label}
                fullWidth
                margin="normal"
                value={value}
                onChange={(e) =>
                  onChange(filter.field as string, e.target.value)
                }
              >
                {filter.options?.map((opt) => {
                    const value = typeof opt === "string" ? opt : opt.value;
                    const label = typeof opt === "string" ? opt : opt.label;

                    return (
                        <MenuItem key={String(value)} value={value}>
                        {label}
                        </MenuItem>
                    );
                    })}

              </TextField>
            );
          }

          return null;
        })}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={onApply}>
            Применить
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
};
