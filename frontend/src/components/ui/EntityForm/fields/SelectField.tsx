import { MenuItem, TextField } from "@mui/material";
import type { Entity, EntityField } from "../../../../types/entities";

interface Props<T extends Entity> {
  field: EntityField<T>;
  value: string;
  onChange: (value: string) => void;
}

export const SelectField = <T extends Entity>({ field, value, onChange }: Props<T>) => (
  <TextField
    select
    label={field.label}
    required={field.required}
    fullWidth
    margin="normal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {field.options?.map((opt) => {
      const optValue = typeof opt === "string" ? opt : opt.value;
      const label = typeof opt === "string" ? opt : opt.label;
      return (
        <MenuItem key={String(optValue)} value={optValue}>
          {label}
        </MenuItem>
      );
    })}
  </TextField>
);