import type { Entity, EntityConfig } from "../../../types/entities";

export interface EntityFormProps<T extends Entity> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any, photo?: File) => Promise<void>;
  config: EntityConfig<T>;
  photoFile: File | null;
  onPhotoChange: (file: File | null) => void;
  editingItem?: T | null;
}