import { Box, Paper, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useState } from "react";

export const AuthPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("specialist");

  const handleLogin = () => {
    console.log("Логин:", username, "Пароль:", password, "Роль:", role);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#ced4da",
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "40vw",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#ffffff"
        }}
        elevation={3}
      >
        <Typography variant="h5" align="center">
          Вход
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="role-label">Тип пользователя</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label="Тип пользователя"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="specialist">Специалист</MenuItem>
            <MenuItem value="admin">Администратор</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleLogin} fullWidth>
          Войти
        </Button>
      </Paper>
    </Box>
  );
};
