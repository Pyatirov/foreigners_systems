import { TextField } from "@mui/material";
import { ClearAdornment } from "../../Adornments/Adornments";
import type { Entity, EntityField } from "../../../../types/entities";

interface Props<T extends Entity> {
  field: EntityField<T>;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const StringField = <T extends Entity>({ field, value, onChange, onClear }: Props<T>) => (
  <TextField
    type="text"
    label={field.label}
    required={field.required}
    fullWidth
    margin="normal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    slotProps={{
      input: {
        endAdornment: <ClearAdornment show={value !== ""} onClear={onClear} />,
      },
    }}
  />
);