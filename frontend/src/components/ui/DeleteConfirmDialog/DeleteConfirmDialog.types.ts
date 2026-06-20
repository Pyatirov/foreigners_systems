import type { Entity, EntityConfig } from "../../../types/entities";

export interface DeleteConfirmDialogProps<T extends Entity> {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: Entity;
  config: EntityConfig<T>;
  displayText?: string;
  count?: number;
}