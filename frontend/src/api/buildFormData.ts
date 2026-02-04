export const buildFormData = (item: any, file?: File): FormData | typeof item => {
  if (!file) return item;

  const formData = new FormData();

  Object.entries(item).forEach(([key, value]) => {
    if (key === "photoUrl") return; // фото будет отдельно
    if (value !== undefined && value !== null && typeof value !== "object") {
      formData.append(key, String(value));
    }
  });

  formData.append("photo", file);

  return formData;
};
