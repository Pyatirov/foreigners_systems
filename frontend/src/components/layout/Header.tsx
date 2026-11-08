
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LogoutIcon from "@mui/icons-material/Logout";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { logoutRequest } from "../../api/auth.api";

const BORDER_COLOR = "#DFBFBC";
const TEXT_COLOR = "#393433";
const MUTED_COLOR = "#77706E";

const Header = () => {
  const navigate = useNavigate();

  const { user, logout, isAuth, role } = useAuth();

  const [search, setSearch] = useState("");

  const isAdmin = role === "admin";

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/students?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      logout();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        height: 80,
        minHeight: 80,
        width: "100%",
        pl: 0,
        pr: { xs: 2, md: 4, lg: 5 },
        display: "flex",
        alignItems: "center",
        gap: { xs: 1.5, md: 2.5 },
        bgcolor: "#FFFFFF",
        color: TEXT_COLOR,
        borderBottom: `1px solid ${BORDER_COLOR}`,
        boxSizing: "border-box",
        zIndex: 1200,
      }}
    >
      {/* ЛОГОТИП И РАЗДЕЛИТЕЛЬ */}
    <Box
      sx={{
        position: "relative",
        width: 76,
        minWidth: 76,
        height: "100%",
        display: "flex",
        alignItems: "center",
        pl: 1,
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
    <Box
      component="img"
      src={logo}
      alt="Логотип УМС"
      sx={{
        display: "block",
        width: 56,
        height: 44,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />

    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: "1px",
        height: 34,
        bgcolor: BORDER_COLOR,
      }}
    />
    </Box>

      {/* НАЗВАНИЕ */}
      <Typography
        sx={{
          fontSize: { xs: "1rem", md: "1.15rem" },
          fontWeight: 600,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        СЭД УМС
      </Typography>

      {/* ПОИСК */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          flex: "1 1 auto",
          minWidth: 80,
          maxWidth: 520,
          mx: { xs: 0, md: "auto" },
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск студентов..."
          aria-label="Поиск студентов"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 21,
                      color: MUTED_COLOR,
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <Tooltip title="Очистить поиск">
                    <IconButton
                      type="button"
                      size="small"
                      onClick={() => setSearch("")}
                      aria-label="Очистить поиск"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 42,
              bgcolor: "#FFFFFF",
              borderRadius: "12px",
              fontSize: "0.9rem",

              "& fieldset": {
                borderColor: BORDER_COLOR,
              },

              "&:hover fieldset": {
                borderColor: "#CBA6A2",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#CBA6A2",
                borderWidth: "1px",
              },
            },

            "& .MuiInputBase-input::placeholder": {
              color: MUTED_COLOR,
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* ПРОФИЛЬ */}
      {isAuth && user && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 1.5 },
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#F1E5E3",
              color: TEXT_COLOR,
              fontSize: "0.9rem",
              fontWeight: 600,
              border: `1px solid ${BORDER_COLOR}`,
            }}
          >
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </Avatar>

          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              maxWidth: { sm: 140, md: 200 },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: MUTED_COLOR,
              }}
            >
              {isAdmin ? "Администратор" : "Специалист отдела"}
            </Typography>
          </Box>

          <Tooltip title="Выйти из системы">
            <IconButton
              onClick={handleLogout}
              aria-label="Выйти из системы"
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: MUTED_COLOR,
                borderRadius: "10px",

                "&:hover": {
                  bgcolor: "#F8F3F2",
                  color: TEXT_COLOR,
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default Header;
