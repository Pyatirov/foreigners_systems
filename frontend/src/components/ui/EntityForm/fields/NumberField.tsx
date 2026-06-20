import { TextField } from "@mui/material";
import { ClearAdornment } from "../../Adornments/Adornments";
import type { Entity, EntityField } from "../../../../types/entities";

const AGE_MIN = 10;

interface Props<T extends Entity> {
  field: EntityField<T>;
  value: number | "";
  onChange: (value: number | "") => void;
  onClear: () => void;
}

export const NumberField = <T extends Entity>({ field, value, onChange, onClear }: Props<T>) => {
  const isAge = field.name === "age";

  return (
    <TextField
      type="number"
      label={field.label}
      required={field.required}
      fullWidth
      margin="normal"
      inputProps={isAge ? { min: AGE_MIN } : {}}
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const parsed = raw === "" ? "" : Number(raw);
        const safeValue =
          isAge && typeof parsed === "number" && !isNaN(parsed) && parsed < AGE_MIN
            ? AGE_MIN
            : parsed;
        onChange(safeValue as number | "");
      }}
      slotProps={{
        input: {
          endAdornment: <ClearAdornment show={value !== ""} onClear={onClear} />,
        },
      }}
    />
  );
};