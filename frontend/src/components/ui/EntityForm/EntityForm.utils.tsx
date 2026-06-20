import type React from "react";
import type { Entity, EntityField } from "../../../types/entities";
import { StringField, NumberField, DateField, SelectField, CountryField, PhotoField } from "./fields";

export const renderField = <T extends Entity>(
  field: EntityField<T>,
  form: Partial<T>,
  handlers: {
    handleChange: (name: keyof T, value: any) => void;
    handleClear: (name: keyof T) => void;
    onPhotoChange: (file: File | null) => void;
  },
  photoFile: File | null,
): React.ReactNode => {
  const value = form[field.name] ?? "";
  const onChange = (v: any) => handlers.handleChange(field.name, v);
  const onClear = () => handlers.handleClear(field.name);

  switch (field.type) {
    case "string":
      return <StringField key={String(field.name)} field={field} value={value as string} onChange={onChange} onClear={onClear} />;
    case "number":
      return <NumberField key={String(field.name)} field={field} value={value as number | ""} onChange={onChange} onClear={onClear} />;
    case "date":
      return <DateField key={String(field.name)} field={field} value={value} onChange={onChange} />;
    case "select":
      return field.name === "country"
        ? <CountryField key={String(field.name)} field={field} value={value as string} onChange={onChange} />
        : <SelectField key={String(field.name)} field={field} value={value as string} onChange={onChange} />;
    case "photo":
      return <PhotoField key={String(field.name)} field={field} hasPhoto={Boolean(form[field.name])} photoFile={photoFile} onPhotoChange={handlers.onPhotoChange} />;
    default:
      return null;
  }
};