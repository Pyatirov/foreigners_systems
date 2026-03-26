import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  row: any;
}

interface TableContextMenuProps {
  contextMenu: ContextMenuState | null;
  onClose: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export const TableContextMenu: React.FC<TableContextMenuProps> = ({
  contextMenu,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {onEdit && (
        <MenuItem onClick={() => { onEdit(contextMenu?.row); onClose(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
      )}
      {onEdit && onDelete && <Divider />}
      {onDelete && (
        <MenuItem
          onClick={() => { onDelete(contextMenu?.row); onClose(); }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};