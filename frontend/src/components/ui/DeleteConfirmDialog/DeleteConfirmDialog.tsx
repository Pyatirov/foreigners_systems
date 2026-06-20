import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";
import type { Entity } from "../../../types/entities";
import type { DeleteConfirmDialogProps } from "./DeleteConfirmDialog.types";
import { getDisplayText, getRecordWord } from "./DeleteConfirmDialog.utils";

export const DeleteConfirmDialog = <T extends Entity>({
  open, 
  onClose, 
  onConfirm, 
  item, 
  config, 
  displayText,
  count
}: DeleteConfirmDialogProps<T>) => {
  
  if (!item) return null;

  const itemDisplayText = displayText ?? getDisplayText(item, config);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Удаление</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы действительно хотите удалить{" "}
            {count && count > 1
              ? <strong>{count} {getRecordWord(count)}</strong>
              : getRecordWord(1)
            }{" "}
            из таблицы <strong>{config.title}</strong>?
          </Typography>
          <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1, borderLeft: "4px solid #d32f2f" }}>
            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: "pre-line" }}>
              <strong>{itemDisplayText}</strong>
            </Typography>
          </Box>
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 2 }}>
            Это действие необратимо.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ mr: 2, mb: 1 }}>
        <Button onClick={onClose} variant="outlined">Отмена</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
};