import {
  Box,
  AppBar,
  Tabs,
  Tab,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { logoutRequest } from "../../api/auth.api";

const BORDER_COLOR = "#DFBFBC";
const TEXT_COLOR = "#393433";
const MUTED_COLOR = "#77706E";
const HOVER_COLOR = "#F8F3F2";

const documentPaths = [
  "/passports",
  "/visas",
  "/education_documents",
  "/petitions",
  "/medical_reports",
  "/migration_cards",
  "/arrival_notifications",
  "/education_agreements",
  "/termination_notifications",
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState("");

  const { user, logout, isAuth, role } = useAuth();

  const isAdmin = role === "admin";
  const isDocumentsMenuOpen = Boolean(anchorEl);

  const currentTab = isAdmin
    ? 0
    : documentPaths.includes(location.pathname)
      ? 1
      : 0;

  const handleDocumentsHover = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDocumentsLeave = () => {
    setAnchorEl(null);
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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    navigate(`/students?search=${encodeURIComponent(query)}`);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        color: TEXT_COLOR,
      }}
    >
      {/* ОСНОВНАЯ ПАНЕЛЬ */}
      <Box
        sx={{
          minHeight: { xs: 72, md: 84 },
          px: { xs: 2, md: 4, lg: 5 },
          py: { xs: 1.5, md: 2 },
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, md: 2.5 },
          flexWrap: "wrap",
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxSizing: "border-box",
        }}
      >
        {/* ЛОГОТИП */}
        <Box
          component={Link}
          to="/"
          aria-label="На главную"
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Логотип УМС"
            sx={{
              display: "block",
              width: "auto",
              height: { xs: 36, md: 44 },
              maxWidth: 140,
              objectFit: "contain",
            }}
          />
        </Box>

        {/* ВЕРТИКАЛЬНЫЙ РАЗДЕЛИТЕЛЬ */}
        <Box
          aria-hidden="true"
          sx={{
            width: "1px",
            height: 34,
            bgcolor: BORDER_COLOR,
            flexShrink: 0,
          }}
        />

        {/* НАЗВАНИЕ СИСТЕМЫ */}
        <Typography
          component="div"
          sx={{
            fontSize: { xs: "1rem", md: "1.15rem" },
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: TEXT_COLOR,
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
            flex: { xs: "1 1 100%", md: "1 1 auto" },
            order: { xs: 3, md: 0 },
            minWidth: 180,
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
              htmlInput: {
                "aria-label": "Поиск студентов",
              },
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
                        onClick={handleClearSearch}
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
                transition: "background-color 0.2s ease",

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

        {/* ПОЛЬЗОВАТЕЛЬ */}
        <Box
          sx={{
            ml: { xs: "auto", md: 0 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 1.5 },
            flexShrink: 0,
          }}
        >
          {isAuth && user && (
            <>
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
                  maxWidth: { sm: 150, md: 220 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: TEXT_COLOR,
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
                    ml: { xs: 0, md: 0.5 },
                    width: 36,
                    height: 36,
                    color: MUTED_COLOR,
                    borderRadius: "10px",
                    transition: "all 0.2s ease",

                    "&:hover": {
                      bgcolor: HOVER_COLOR,
                      color: TEXT_COLOR,
                    },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          color: TEXT_COLOR,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Tabs
          value={currentTab}
          centered
          textColor="inherit"
          sx={{
            minHeight: 48,

            "& .MuiTabs-indicator": {
              height: 2,
              bgcolor: BORDER_COLOR,
            },

            "& .MuiTab-root": {
              minHeight: 48,
              px: 3,
              fontSize: "0.9rem",
              fontWeight: 500,
              textTransform: "none",
              color: MUTED_COLOR,
              transition: "color 0.2s ease",

              "&:hover": {
                color: TEXT_COLOR,
                bgcolor: HOVER_COLOR,
              },
            },

            "& .Mui-selected": {
              color: TEXT_COLOR,
              fontWeight: 600,
            },
          }}
        >
          {isAdmin && (
            <Tab
              label="Администрирование"
              component={Link}
              to="/admin/users"
              disableRipple
            />
          )}

          {!isAdmin && (
            <Tab
              label="Студенты"
              component={Link}
              to="/students"
              disableRipple
            />
          )}

          {!isAdmin && (
            <Tab
              label="Документы"
              disableRipple
              onMouseEnter={handleDocumentsHover}
              sx={{ cursor: "pointer" }}
            />
          )}
        </Tabs>

        {!isAdmin && (
          <Menu
            anchorEl={anchorEl}
            open={isDocumentsMenuOpen}
            onClose={handleDocumentsLeave}
            MenuListProps={{
              onMouseLeave: handleDocumentsLeave,
              sx: { py: 0.5 },
            }}
            PaperProps={{
              elevation: 2,
              sx: {
                minWidth: 250,
                mt: 0.5,
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                overflow: "hidden",
              },
            }}
            sx={{
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.25,
                color: TEXT_COLOR,
                fontSize: "0.9rem",
                fontWeight: 500,
                whiteSpace: "normal",
                lineHeight: 1.5,

                "&:hover": {
                  bgcolor: HOVER_COLOR,
                },
              },
            }}
          >
            <MenuItem
              component={Link}
              to="/passports"
              onClick={handleDocumentsLeave}
            >
              Удостоверения личности
            </MenuItem>

            <MenuItem
              component={Link}
              to="/visas"
              onClick={handleDocumentsLeave}
            >
              Визы
            </MenuItem>

            <MenuItem
              component={Link}
              to="/education_documents"
              onClick={handleDocumentsLeave}
            >
              Документы об образовании
            </MenuItem>

            <MenuItem
              component={Link}
              to="/petitions"
              onClick={handleDocumentsLeave}
            >
              Ходатайства
            </MenuItem>

            <MenuItem
              component={Link}
              to="/medical_reports"
              onClick={handleDocumentsLeave}
            >
              Медицинские заключения
            </MenuItem>

            <MenuItem
              component={Link}
              to="/migration_cards"
              onClick={handleDocumentsLeave}
            >
              Миграционные карты
            </MenuItem>

            <MenuItem
              component={Link}
              to="/arrival_notifications"
              onClick={handleDocumentsLeave}
            >
              Уведомления о прибытии
            </MenuItem>

            <MenuItem
              component={Link}
              to="/education_agreements"
              onClick={handleDocumentsLeave}
            >
              Договоры об образовании
            </MenuItem>

            <MenuItem
              component={Link}
              to="/termination_notifications"
              onClick={handleDocumentsLeave}
            >
              Уведомления об окончании или досрочном прекращении обучения
            </MenuItem>
          </Menu>
        )}
      </AppBar>
    </Box>
  );
};

export default Header;