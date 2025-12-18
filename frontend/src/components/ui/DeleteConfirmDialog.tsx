import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import type { EntityConfig } from "../../types/entities";

interface DeleteConfirmDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: T | { _id: string; name: string }; // <-- тут
  config: EntityConfig<T>;
}


export const DeleteConfirmDialog = <T extends Record<string, any>>({
  open,
  onClose,
  onConfirm,
  item,
  config,
}: DeleteConfirmDialogProps<T>) => {
  if (!item) return null;

  // Display key field (name, title, etc.)
  const displayField = config.columns[0]?.field;
  const itemDisplayText = displayField ? (item as any)[displayField] : JSON.stringify(item);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete {config.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы действительно хотите удалить {config.title.toLowerCase()}?
          </Typography>
          <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #d32f2f" }}>
            <Typography variant="body2" color="textSecondary">
              <strong>{itemDisplayText}</strong>
            </Typography>
          </Box>
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 2 }}>
            Это действие необратимо.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ mr: 2, mb: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
