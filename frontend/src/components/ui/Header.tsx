import { Box, AppBar, Tabs, Tab, Typography, Menu, MenuItem, Toolbar, IconButton, Tooltip, Avatar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../../assets/logo.svg'
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDocumentsMenuOpen = Boolean(anchorEl);
  const { user, logout, isAuth } = useAuth();

  console.log("HEADER AUTH CHECK:", {
  isAuth,
  user,
});

  const currentTab = {
    "/students": 0,
    "/passports": 1,
    "/visas": 1,
    "/education_documents": 1,
    "/petitions": 1,
    "/medical_reports": 1,
    "/migration_cards": 1,
    "/arrivals": 1,
    "/education_agreement": 1,
    "/termination_notices": 1,
  }[location.pathname] ?? 0;

  const handleDocumentsHover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDocumentsLeave = () => {
    setAnchorEl(null);
  };

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
        }}
      >
        {/* ЛЕВАЯ ЧАСТЬ — ЛОГО */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogoutIcon fontSize="small" sx={{"&:hover": { color: "secondary.main" }}} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <AppBar position="static" sx={{ bgcolor: "#1D1D1D", boxShadow: 3, }} >
        <Tabs value={currentTab} centered
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

            "& .MuiTabs-indicator": {
              backgroundColor: "#b7a284",
              height: 4,
            },
          }}
        >
          <Tab label="Студенты" component={Link} to="/students" disableRipple />
          <Tab 
            label="Документы" 
            disableRipple
            onMouseEnter={handleDocumentsHover}
            sx={{ cursor: "pointer" }}
          />
        </Tabs>

        {/* Documents Dropdown Menu */}
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
      </AppBar>
    </>
  );
};

export default Header;
