import { Box, Button, Typography } from "@mui/material";
import type { Entity, EntityField } from "../../../../types/entities";

const LABELS = {
  upload: "Загрузить фото",
  change: "Изменить фото",
  selected: "Выбран файл",
} as const;

interface Props<T extends Entity> {
  field: EntityField<T>;
  hasPhoto: boolean;
  photoFile: File | null;
  onPhotoChange: (file: File | null) => void;
}

export const PhotoField = <T extends Entity>({ hasPhoto, photoFile, onPhotoChange }: Props<T>) => (
  <Box sx={{ my: 2 }}>
    <Button variant="outlined" component="label">
      {hasPhoto ? LABELS.change : LABELS.upload}
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
      />
    </Button>
    {photoFile && (
      <Box mt={1}>
        <Typography variant="body2">
          {LABELS.selected}: {photoFile.name}
        </Typography>
      </Box>
    )}
  </Box>
);