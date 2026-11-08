import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { Entity } from "../../../types/entities";
import type { EntityFormProps } from "./EntityForm.types";
import { renderField } from "./EntityForm.utils";

dayjs.locale("ru");

export const EntityForm = <T extends Entity>({
  open,
  onClose,
  onSubmit,
  config,
  photoFile,
  onPhotoChange,
  editingItem,
}: EntityFormProps<T>) => {
  const [form, setForm] = useState<Partial<T>>({});

  useEffect(() => {
    if (open && editingItem) {
      setForm({ ...editingItem });
    } else if (open) {
      setForm({});
    }
  }, [open, editingItem]);

  const handleChange = (name: keyof T, value: unknown) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = (name: keyof T) => {
    setForm((prev) => ({ ...prev, [name]: "" }));
  };

  const preparedFormData = (value: Partial<T>): Partial<T> => {
    const data = { ...value } as Record<string, unknown>;
    if (data.sex !== undefined) {
      data.sex = data.sex === "М" ? true : data.sex === "Ж" ? false : data.sex;
    }
    return data as Partial<T>;
  };

  const handleSubmit = () => {
    // Не очищаем форму сразу: если API вернёт ошибку валидации,
    // пользователь сможет исправить данные, не заполняя всё заново.
    onSubmit(preparedFormData(form), photoFile || undefined);
  };

  const handleClose = () => {
    setForm({});
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingItem ? `Редактировать ${config.title}` : `Добавить ${config.title}`}
        </DialogTitle>

        <DialogContent>
          {config.fields.map((field) => (
            <div key={String(field.name)}>
              {renderField(
                field,
                form,
                { handleChange, handleClear, onPhotoChange },
                photoFile
              )}
            </div>
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
