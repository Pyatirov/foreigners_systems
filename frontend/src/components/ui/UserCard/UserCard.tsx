import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { userApi } from "../../../api/user.api";
import { formatDateTime } from "../DataTable/DataTable.utils";
import { USER_ROLE_LABELS } from "../../../constants/roles";
import type { UserCardData, UserRole } from "./UserCard.types";

interface UserCardProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onUpdated?: () => void;
}

export const UserCard = ({ open, onClose, userId, onUpdated }: UserCardProps) => {
  const [user, setUser] = useState<UserCardData | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !open) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userApi.getById(userId);
        setUser(data);
        setRole(data.role);
      } catch {
        setUser(null);
        setError("Пользователь не найден");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userApi.update(user._id, { role });
      setUser(updated);
      setRole(updated.role);
      onUpdated?.();
    } catch {
      setError("Не удалось сохранить роль");
    } finally {
      setSaving(false);
    }
  };

  const roleChanged = user != null && role !== user.role;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Карточка пользователя</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="caption" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>

            <Grid size={12}>
              <Typography variant="caption" color="textSecondary">
                Дата регистрации
              </Typography>
              <Typography variant="body1">{formatDateTime(user.createdAt)}</Typography>
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel id="user-role-label">Роль</InputLabel>
                <Select
                  labelId="user-role-label"
                  label="Роль"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((value) => (
                    <MenuItem key={value} value={value}>
                      {USER_ROLE_LABELS[value]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {error && (
              <Grid size={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Typography>{error ?? "Пользователь не найден"}</Typography>
        )}
      </DialogContent>

      <DialogActions>
        {user && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!roleChanged || saving}
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
