import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru"; 
import type { Entity } from "../../../types/entities";
import React from "react";
import type { EntityFormProps } from "./EntityForm.types";
import { renderField } from "./EntityForm.utils";

dayjs.locale("ru");

export const EntityForm = <T extends Entity>({
  open,                                           // открытие формы                        
  onClose,                                        // функция закрытия формы
  onSubmit,                                       // функция отправки данных формы                  
  config,                                         // конфигурация полей формы                         
  photoFile,                                      // текущий файл фотографии (если есть)
  onPhotoChange,                                  // функция для обновления файла фотографии                   
  editingItem,                                    // редактируемый элемент (если есть)                  
}: EntityFormProps<T>) => {
  const [form, setForm] = useState<Partial<T>>({});

  useEffect(() => {
    if (open && editingItem) {
      setForm({ ...editingItem });
    } else if (open) {
      setForm({});
    }
  }, [open, editingItem]);

  const handleChange = (name: keyof T, value: any) => {
    setForm( prev => ({ ...prev, [name]: value }));
  };

  const handleClear = (name: keyof T) => {
    setForm( prev => ({ ...prev, [name]: "" }));
  };

  const preparedFormData = (form: any): any => ({
    ...form,
    ...(form.sex !== undefined && {
      sex: form.sex === "М" ? true : form.sex === "Ж" ? false : form.sex
    })
  });
  const handleSubmit = () => {
    onSubmit(preparedFormData(form), photoFile || undefined);
    setForm({});
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
            <React.Fragment key={String(field.name)}>
              {renderField(field, form, { handleChange, handleClear, onPhotoChange }, photoFile)}
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