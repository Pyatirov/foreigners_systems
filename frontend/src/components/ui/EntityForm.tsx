import { useState, useEffect } from "react";
import { Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, InputAdornment, IconButton } from "@mui/material";
import CountryFlag from "react-country-flag";
import { Clear } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { EntityConfig, EntityField } from "../../types/entities";
import React from "react";
import { COUNTRY_MAP, COUNTRY_OPTIONS } from "../../utils/countryMap";

interface EntityFormProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  config: EntityConfig<T>;
  editingItem?: T | null;
}

dayjs.locale("ru");

export const EntityForm = <T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  config,
  editingItem,
}: EntityFormProps<T>) => {
  const [form, setForm] = useState<Partial<T>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  // Автозаполнение при редактировании
  useEffect(() => {
    if (open && editingItem) {
      setForm({ ...editingItem });
    } else if (open) {
      setForm({});
    }
  }, [open, editingItem]);

  const handleChange = (name: keyof T, value: any) => {
    setForm({ ...form, [name]: value });
  };

  const handleClear = (name: keyof T) => {
    setForm({ ...form, [name]: "" });
  };

  const handleSubmit = () => {
    const prepared: any = { ...form };

    if (prepared.sex === "М") {
      prepared.sex = true;
    } else if (prepared.sex === "Ж") {
      prepared.sex = false;
    }

    onSubmit(prepared as T);
    setForm({});
  };

  // const handleSubmit = () => {
  // const validationErrors = validateRequiredFields(fields, form);

  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }

  //   // ✅ форма валидна — отправляем
  //   console.log("SUBMIT", form);
  // };


type FieldConfig = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
};

type FormErrors = Record<string, string>;

function validateRequiredFields(
    fields: FieldConfig[],
    form: Record<string, any>
  ): FormErrors {
    const errors: FormErrors = {};

    fields.forEach((field) => {
      if (!field.required) return;

      const value = form[field.name];

      const isEmpty =
        value === null ||
        value === undefined ||
        value === "" ||
        (value instanceof Date && isNaN(value.getTime()));

      if (isEmpty) {
        errors[field.name] = "Поле обязательно для заполнения";
      }
    });

    return errors;
  }


  const handleClose = () => {
    setForm({});
    onClose();
  };

  const ClearAdornment = ({ show, onClear }: {
    show: boolean;
    onClear: () => void;
  }) => {
    if (!show) return null;
    return (
      <InputAdornment position="end">
        <IconButton
          size="small"
          onClick={onClear}
          edge="end"
          aria-label="Очистить поле"
        >
          <Clear fontSize="small" />
        </IconButton>
      </InputAdornment>
    );
  };

const renderField = (field: EntityField<T>) => {
  const rawValue = form[field.name];
  const fieldValue = rawValue ?? "";
  const showClearButton = fieldValue !== "";

  switch (field.type) {
    case "string":
      return (
        <TextField
          key={String(field.name)}
          type="text"
          label={field.label}
          required={field.required}
          fullWidth
          margin="normal"
          value={fieldValue}
          onChange={(e) => handleChange(field.name, e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <ClearAdornment
                  show={showClearButton}
                  onClear={() => handleClear(field.name)}
                />
              ),
            },
          }}
        />
      );

    case "number":
      return (
        <TextField
          key={String(field.name)}
          type="number"
          label={field.label}
          required={field.required}
          fullWidth
          margin="normal"
          inputProps={field.name === "age" ? { min: 10 } : {}}
          value={fieldValue}
          onChange={(e) => {
            const raw = e.target.value;

            // безопасный парсинг числа
            const parsed = raw === "" ? "" : Number(raw);

            // валидация возраста
            const safeValue =
              field.name === "age" &&
              typeof parsed === "number" &&
              !isNaN(parsed) &&
              parsed < 10
                ? 10
                : parsed;

            handleChange(field.name, safeValue);
          }}
          slotProps={{
            input: {
              endAdornment: (
                <ClearAdornment
                  show={showClearButton}
                  onClear={() => handleClear(field.name)}
                />
              ),
            },
          }}
        />
      );

    case "date": {
      const dateValue =
        fieldValue && fieldValue !== "" ? dayjs(fieldValue) : null;

      const today = dayjs();
      const minDate = today.subtract(110, "years");
      const maxDate = today.subtract(10, "years");

      return (
        <DatePicker
          key={String(field.name)}
          label={field.label}
          value={dateValue}
          minDate={minDate}
          maxDate={maxDate}
          format="DD.MM.YYYY"
          onChange={(newValue) => {
            handleChange(field.name, newValue ? newValue.toDate() : null);
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              required: field.required,
            }
          }}
        />
      );
    }


    // -------------------------------
    // SELECT FIELD
    // -------------------------------
    case "select":
      if (field.name === "country") {
        return (
          <Autocomplete
            key={String(field.name)}
            options={COUNTRY_OPTIONS}
            value={form[field.name] || null}
            onChange={(_e, newValue) => handleChange(field.name, newValue || "")}
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
      } else {
        return (
        <TextField
          key={String(field.name)}
          select
          label={field.label}
          required={field.required}
          fullWidth
          margin="normal"
          value={fieldValue}
          onChange={(e) =>
          handleChange(field.name, e.target.value)}
        >
          {field.options?.map((opt) => {
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
    // -------------------------------
    default:
      return null;
  }
};


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingItem ? `Редактировать ${config.title}` : `Добавить ${config.title}`}
        </DialogTitle>

        <DialogContent>
          {config.fields.map((field) => (
            <React.Fragment key={String(field.name)}>
              {renderField(field)}
            </React.Fragment>
          ))}
        </DialogContent>


        <DialogActions sx={{ mr: 4, mb: 1 }}>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingItem ? "Обновить" : "Сохранить"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};