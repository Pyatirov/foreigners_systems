import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { Entity, EntityField } from "../../../../types/entities";

const DATE_CONSTRAINTS = {
  MIN_AGE_YEARS: 10,
  MAX_AGE_YEARS: 110,
} as const;

interface Props<T extends Entity> {
  field: EntityField<T>;
  value: any;
  onChange: (value: Date | null) => void;
}

export const DateField = <T extends Entity>({ field, value, onChange }: Props<T>) => {
  const dateValue = value && value !== "" ? dayjs(value) : null;
  const today = dayjs();

  return (
    <DatePicker
      label={field.label}
      value={dateValue}
      minDate={today.subtract(DATE_CONSTRAINTS.MAX_AGE_YEARS, "years")}
      maxDate={today.subtract(DATE_CONSTRAINTS.MIN_AGE_YEARS, "years")}
      format="DD.MM.YYYY"
      onChange={(newValue) => onChange(newValue ? newValue.toDate() : null)}
      slotProps={{
        textField: {
          fullWidth: true,
          margin: "normal",
          required: field.required,
        },
      }}
    />
  );
};