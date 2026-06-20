import { Box, Paper, Typography, TextField, Button, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, InputAdornment, IconButton } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/auth.api";
import { parseJwt, useAuth } from "../context/AuthContext";
import { Visibility, VisibilityOff, Clear } from "@mui/icons-material";
import { ErrorBox } from "../components/ui/ErrorBox";

export const AuthPage = () => {
  const navigate = useNavigate();
  
  const { login, user } = useAuth();

  const [tab, setTab] = useState(0); // 0 = Вход, 1 = Регистрация
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async () => {
    setError("");
    try {
      if (!email || !password) {
        setError("Введите логин и пароль");
        return;
      }

      const accessToken = await loginRequest({ email, password });
      login(accessToken);
      const payload = parseJwt(accessToken);
      navigate(payload?.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err: any) {
      setError("Неверный логин или пароль");
    }
  };

  const handleRegister = async () => {
    setError("");
    try {
      if (!email || !password || !confirmPassword) {
        setError("Заполните все поля");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      await registerRequest({ email, password, role });
      const accessToken = await loginRequest({ email, password });
      login(accessToken);
      const payload = parseJwt(accessToken);
      navigate(payload?.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err: any) {
      setError("Ошибка регистрации или пользователь уже существует");
    }
  };  

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#ced4da",
          pt: user ? "64px" : 0,
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: "40vw",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: "#ffffff",
          }}
          elevation={3}
        >
          <Tabs value={tab} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{
              "& .MuiTab-root:focus": { outline: "none" },
              "& .MuiTab-root.Mui-focusVisible": { outline: "none" },
            }}
          >
            <Tab label="Войти" />
            <Tab label="Зарегистрироваться" />
          </Tabs>

          <Typography variant="h5" align="center">
            {tab === 0 ? "Вход" : "Регистрация"}
          </Typography>

          {tab === 1 && (
            <FormControl fullWidth>
              <InputLabel id="role-label">Роль</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Роль"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="user">Специалист</MenuItem>
                <MenuItem value="admin">Администратор</MenuItem>
              </Select>
            </FormControl>
          )}


          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                endAdornment: email && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setEmail("")} edge="end" size="small">
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Пароль"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="new-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {password && (
                      <IconButton onClick={() => setPassword("")} edge="end" size="small">
                        <Clear fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {tab === 1 && (
            <TextField
              label="Повторите пароль"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmPassword && (
                        <IconButton onClick={() => setConfirmPassword("")} edge="end" size="small">
                          <Clear fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton onClick={() => setShowConfirmPassword(v => !v)} edge="end" size="small">
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          <ErrorBox message={error} />

          <Button
            variant="contained"
            onClick={tab === 0 ? handleLogin : handleRegister}
            fullWidth
          >
            {tab === 0 ? "Войти" : "Зарегистрироваться"}
          </Button>
        </Paper>
      </Box>
    </>
  );
};
