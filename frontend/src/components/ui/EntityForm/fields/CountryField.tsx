import { Autocomplete, TextField } from "@mui/material";
import CountryFlag from "react-country-flag";
import { COUNTRY_MAP, COUNTRY_OPTIONS } from "../../../../utils/countryMap";
import type { Entity, EntityField } from "../../../../types/entities";

interface Props<T extends Entity> {
  field: EntityField<T>;
  value: string | null;
  onChange: (value: string) => void;
}

export const CountryField = <T extends Entity>({ field, value, onChange }: Props<T>) => (
  <Autocomplete
    options={COUNTRY_OPTIONS}
    value={value || null}
    onChange={(_e, newValue) => onChange(newValue || "")}
    freeSolo
    renderOption={(props, option) => (
      <li {...props}>
        <CountryFlag
          countryCode={COUNTRY_MAP[option]}
          svg
          style={{ width: "1.5em", marginRight: 8 }}
        />
        {option}
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label={field.label}
        required={field.required}
        fullWidth
        margin="normal"
      />
    )}
  />
);