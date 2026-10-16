import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "../api/auth.api";
import { parseJwt, useAuth } from "../context/AuthContext";
import { Visibility, VisibilityOff, Clear } from "@mui/icons-material";
import { ErrorBox } from "../components/ui/ErrorBox";

type ApiError = {
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: {
      message?: unknown;
    };
  };
  message?: string;
};

function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const apiError = error as ApiError;
  const status = apiError.response?.status;
  const serverMessage = apiError.response?.data?.message;

  if (status === 401) {
    return "Неверный email или пароль";
  }

  if (
    status === 409 ||
    serverMessage === "User already exists"
  ) {
    return "Пользователь с таким email уже зарегистрирован";
  }

  if (serverMessage === "Invalid email") {
    return "Введите корректный email";
  }

  if (
    typeof serverMessage === "string" &&
    serverMessage.includes("Password must contain")
  ) {
    return "Пароль должен содержать от 8 до 72 символов";
  }

  if (status === 400 && serverMessage === "Email and password are required") {
    return "Введите email и пароль";
  }

  if (status !== undefined && status >= 500) {
    return "Ошибка сервера. Проверьте журнал backend";
  }

  if (apiError.isAxiosError && !apiError.response) {
    return "Не удалось связаться с сервером. Проверьте подключение";
  }

  if (
    typeof serverMessage === "string" &&
    serverMessage.trim()
  ) {
    return serverMessage;
  }

  return fallback;
}

function validatePassword(value: string): string {
  if (value.length === 0) {
    return "";
  }

  if (value.length < 8) {
    return "Пароль должен содержать минимум 8 символов";
  }

  if (value.length > 72) {
    return "Пароль не должен превышать 72 символа";
  }

  return "";
}

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [tab, setTab] = useState(0); // 0 = Вход, 1 = Регистрация
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabChange = (
    _event: SyntheticEvent,
    newValue: number
  ) => {
    setTab(newValue);
    setError("");
    setPasswordError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Введите email и пароль");
      return;
    }

    try {
      const accessToken = await loginRequest({
        email: email.trim(),
        password,
      });

      login(accessToken);

      const payload = parseJwt(accessToken);

      navigate(
        payload?.role === "admin" ? "/admin" : "/",
        { replace: true }
      );
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Не удалось войти в систему"
        )
      );
    }
  };

  const handleRegister = async () => {
    setError("");
    setPasswordError("");

    if (!email.trim() || !password || !confirmPassword) {
      setError("Заполните все поля");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setError("Введите корректный email");
      return;
    }

    const validationError = validatePassword(password);

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    // Сначала регистрируем пользователя.
    try {
      await registerRequest({
        email: email.trim(),
        password,
      });
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Не удалось зарегистрироваться"
        )
      );
      return;
    }

    // Регистрация завершилась успешно.
    // Теперь отдельно пытаемся выполнить вход.
    try {
      const accessToken = await loginRequest({
        email: email.trim(),
        password,
      });

      login(accessToken);

      const payload = parseJwt(accessToken);

      navigate(
        payload?.role === "admin" ? "/admin" : "/",
        { replace: true }
      );
    } catch (err: unknown) {
      const loginError = getApiErrorMessage(
        err,
        "Попробуйте войти вручную"
      );

      setTab(0);

      setError(
        `Регистрация прошла успешно, но автоматический вход не выполнен. ${loginError}`
      );
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError("");

    if (tab === 1) {
      setPasswordError(validatePassword(value));
    } else {
      setPasswordError("");
    }
  };

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    confirmPassword !== password;

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#ced4da",
        pt: user ? "64px" : 0,
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: { xs: "90vw", sm: "60vw", md: "40vw" },
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#ffffff",
          boxSizing: "border-box",
        }}
        elevation={3}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root:focus": {
              outline: "none",
            },
            "& .MuiTab-root.Mui-focusVisible": {
              outline: "none",
            },
          }}
        >
          <Tab label="Войти" />
          <Tab label="Зарегистрироваться" />
        </Tabs>

        <Typography variant="h5" align="center">
          {tab === 0 ? "Вход" : "Регистрация"}
        </Typography>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          fullWidth
          required
          autoComplete="email"
          slotProps={{
            input: {
              endAdornment: email && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setEmail("")}
                    edge="end"
                    size="small"
                    aria-label="Очистить email"
                  >
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
          onChange={(e) => handlePasswordChange(e.target.value)}
          fullWidth
          required
          autoComplete={
            tab === 0 ? "current-password" : "new-password"
          }
          error={tab === 1 && Boolean(passwordError)}
          helperText={
            tab === 1
              ? passwordError || "От 8 до 72 символов"
              : undefined
          }
          slotProps={{
            htmlInput:
              tab === 1
                ? {
                    minLength: 8,
                    maxLength: 72,
                  }
                : {},
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {password && (
                    <IconButton
                      onClick={() => {
                        setPassword("");
                        setPasswordError("");
                        setError("");
                      }}
                      edge="end"
                      size="small"
                      aria-label="Очистить пароль"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  )}

                  <IconButton
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    edge="end"
                    size="small"
                    aria-label={
                      showPassword
                        ? "Скрыть пароль"
                        : "Показать пароль"
                    }
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {tab === 1 && (
          <TextField
            label="Повторите пароль"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            fullWidth
            required
            autoComplete="new-password"
            error={passwordsDoNotMatch}
            helperText={
              passwordsDoNotMatch
                ? "Пароли не совпадают"
                : undefined
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {confirmPassword && (
                      <IconButton
                        onClick={() => setConfirmPassword("")}
                        edge="end"
                        size="small"
                        aria-label="Очистить повторный пароль"
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    )}

                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      edge="end"
                      size="small"
                      aria-label={
                        showConfirmPassword
                          ? "Скрыть повторный пароль"
                          : "Показать повторный пароль"
                      }
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
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
  );
};