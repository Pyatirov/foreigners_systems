import { Box, Paper, Typography, TextField, Button, Tabs, Tab, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth.api"; // предполагаем функцию регистрации
import { useAuth } from "../context/AuthContext";
import { BorderAll } from "@mui/icons-material";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab, setTab] = useState(0); // 0 = Вход, 1 = Регистрация
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async () => {
    try {
      setError("");
      if (!email || !password) {
        setError("Введите логин и пароль");
        return;
      }

      const accessToken = await loginRequest({ email, password });
      login(accessToken);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError("Неверный логин или пароль");
    }
  };

  // const handleRegister = async () => {
  //   try {
  //     setError("");
  //     if (!email || !password || !confirmPassword) {
  //       setError("Заполните все поля");
  //       return;
  //     }
  //     if (password !== confirmPassword) {
  //       setError("Пароли не совпадают");
  //       return;
  //     }

  //     await registerRequest({ email, password });
  //     // После успешной регистрации сразу логиним пользователя
  //     const accessToken = await loginRequest({ email, password });
  //     login(accessToken);
  //     navigate("/", { replace: true });
  //   } catch (err: any) {
  //     setError("Ошибка регистрации или пользователь уже существует");
  //   }
  // };

  const handleRegister = async () => {
  try {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    const exists = await User.findOne({ email: 'test@test.com' });
    if (exists) {
      console.log('User already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('123456', 10);

    await User.create({
      email: 'test@test.com',
      passwordHash,
      role: 'admin',
      refreshTokens: [],
    });

    console.log('Test user created');
    process.exit(0);

    // Тут будет твой вызов API регистрации
    console.log("Регистрация:", { email, password });

    // После регистрации можно сразу логинить пользователя
    const accessToken = await loginRequest({ email, password });
    login(accessToken);
    navigate("/", { replace: true });
  } catch (err: any) {
    setError("Ошибка регистрации или пользователь уже существует");
  }
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
          bgcolor: "#ffffff",
        }}
        elevation={3}
      >
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ BorderAll: "0px"}}>
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
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        {tab === 1 && (
          <TextField
            label="Повторите пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        )}

        {error && (
          <Typography color="error" fontSize={14}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={tab === 0 ? handleLogin : handleRegister}
          fullWidth
        >
          {tab === 0 ? "Войти" : "Зарегистрироваться"}
        </Button>
      </Paper>
    </Box>
  );
};
