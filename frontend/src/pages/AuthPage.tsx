import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export const AuthPage = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")

  const handleLogin = async () => {
    try {
      console.log("Login started", email, password)

      if (!email || !password) {
        setError("Введите логин и пароль");
        return
      }

      const accessToken = await loginRequest( { email, password })

      console.log("Login success, token:", accessToken)

      login(accessToken);

      navigate("/", { replace: true })
      console.log('Logged in');
    } catch(err: any) {
      console.error("Login error", err)
      setError("Неверный логин или пароль");
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
          bgcolor: "#ffffff"
        }}
        elevation={3}
      >
        <Typography variant="h5" align="center">
          Вход
        </Typography>

        <TextField
          label="Логин"
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

        {error && (
          <Typography color="error" fontSize={14}>
            {error}
          </Typography>
        )}

        <Button variant="contained" onClick={handleLogin} fullWidth>
          Войти
        </Button>
      </Paper>
    </Box>
  );
};

// import { useState } from "react";
// import { TextField, Button, Box, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { loginRequest } from "../api/auth.api";

// export const AuthPage = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async () => {
//     try {
//       setError("");

//       if (!email || !password) {
//         setError("Введите логин и пароль");
//         return;
//       }

//       const res = await loginRequest( { email, password } );

//       // accessToken приходит в body
//       login(res.data.accessToken);

//       navigate("/", { replace: true });
//     } catch (err) {
//       setError("Неверный логин или пароль");
//     }
//   };

//   return (
//     <Box
//       display="flex"
//       flexDirection="column"
//       gap={2}
//       maxWidth={360}
//       margin="100px auto"
//     >
//       <Typography variant="h5" textAlign="center">
//         Авторизация
//       </Typography>

//       <TextField
//         label="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         fullWidth
//       />

//       <TextField
//         label="Пароль"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         fullWidth
//       />

//       {error && (
//         <Typography color="error" fontSize={14}>
//           {error}
//         </Typography>
//       )}

//       <Button variant="contained" onClick={handleLogin}>
//         Войти
//       </Button>
//     </Box>
//   );
// };
