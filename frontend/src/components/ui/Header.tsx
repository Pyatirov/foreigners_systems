import { Box, AppBar, Tabs, Tab, Typography, Menu, MenuItem, IconButton, Tooltip, Avatar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../../assets/logo.svg'
import { useAuth } from "../../context/AuthContext";
import { logoutRequest } from "../../api/auth.api";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDocumentsMenuOpen = Boolean(anchorEl);
  const { user, logout, isAuth, role } = useAuth();
  const isAdmin = role === "admin";

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

  const currentTab = isAdmin
    ? 0
    : documentPaths.includes(location.pathname)
      ? 1
      : 0;

  const handleDocumentsHover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDocumentsLeave = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      logout() // локально чистим access token / state
      navigate("/auth", { replace: true })
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#1D1D1D",
          px: 3,
          py: 1,
          borderBottom: "1px solid #b7a284",
        }}
      >
        {/* ЛЕВАЯ ЧАСТЬ — ЛОГО */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2 }}>
          <img src={logo} alt="Logo" style={{ height: 50 }} />
        </Box>

        {/* ЦЕНТР — НАЗВАНИЕ */}
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
          }}
        >
          Информационно-аналитическая система УМС
        </Typography>

        {/* ПРАВАЯ ЧАСТЬ — ПОЛЬЗОВАТЕЛЬ */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAuth && user && (
            <>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.email[0].toUpperCase()}
              </Avatar>

              <Typography variant="body2" sx={{ color: "#fff" }}>
                {user.email}
              </Typography>

              <Tooltip title="Выйти">
                <IconButton
                  size="small"
                  sx={{ color: "#fff" }}
                  onClick={() => {handleLogout()}}
                >
                  <LogoutIcon fontSize="small" sx={{"&:hover": { color: "secondary.main" }}} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <AppBar position="static" sx={{ bgcolor: "#1D1D1D", color: "#fff", boxShadow: 3 }}>
        <Tabs
          value={currentTab}
          centered
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: "#b7a284", height: 4 } }}
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              color: "#fff",
              transition: "0.3s",
            },
            "& .MuiTab-root:hover:not(.Mui-selected)": {
              color: "#b7a284",
            },
            "& .Mui-selected": {
              color: "#b7a284 !important",
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
            <Tab label="Студенты" component={Link} to="/students" disableRipple />
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
          onMouseLeave={handleDocumentsLeave}
          MenuListProps={{
            onMouseLeave: handleDocumentsLeave,
          }}
          sx={{
            "& .MuiPaper-root": {
              bgcolor: "#2D2D2D",
            },
            "& .MuiMenuItem-root": {
              color: "#fff",
              fontSize: "0.95rem",
              "&:hover": {
                bgcolor: "#b7a284",
              },
            },
          }}
        >
          <MenuItem 
            component={Link} 
            to="/passports"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Удостоверения личности
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/visas"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Визы
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/education_documents"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Документы об образовании
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/petitions"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Ходатайства
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/medical_reports"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Медицинские заключения
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/migration_cards"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Миграционные карты
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/arrival_notifications"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Уведомления о прибытии
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/education_agreements"
            onClick={handleDocumentsLeave}
            sx={{fontWeight: "bold"}}
          >
            Договоры об образовании
          </MenuItem>
          <MenuItem
            component={Link}
            to="/termination_notifications"
            onClick={handleDocumentsLeave}
          >
            <Typography
              sx={{
                fontWeight: 'bold',
                whiteSpace: 'pre-line',
              }}
            >
              Уведомления о предоставлении академического отпуска,
              {'\n'}
              о завершении или досрочном прекращении обучения
            </Typography>
          </MenuItem>

        </Menu>
        )}
      </AppBar>
    </>
  );
};

export default Header;
