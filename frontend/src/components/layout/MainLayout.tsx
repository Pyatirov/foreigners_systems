// import { Box, AppBar, Tabs, Tab, Typography, Menu, MenuItem } from "@mui/material";
// import { Link, useLocation, Outlet } from "react-router-dom";
// import { useState } from "react";
// import logo from '../../assets/logo.svg'

// const MainLayout = () => {
//   const location = useLocation();
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const isDocumentsMenuOpen = Boolean(anchorEl);

//   const currentTab = {
//     "/students": 0,
//     "/passports": 1,
//     "/visas": 1,
//     "/education_documents": 1,
//     "/petitions": 1,
//     "/medical_reports": 1,
//     "/migration_cards": 1,
//     "/arrivals": 1,
//     "/education_agreement": 1,
//     "/termination_notices": 1,
//   }[location.pathname] ?? 0;

//   const handleDocumentsHover = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleDocumentsLeave = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           bgcolor: "#1D1D1D",
//           px: 3,
//           py: 1,
//         }}
//       >
//         {/* Лого слева */}
//         <Box sx={{ position: "absolute", left: 32, top: 16, display: "flex", alignItems: "center" }}>
//           <img src={logo} alt="Logo" style={{ height: 50, objectFit: "contain" }} />
//         </Box>

//         {/* Название приложения по центру */}
//         <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "pre-line", align: "center" }}>
//           Информационно-аналитическая система УМС
//         </Typography>
//       </Box>
//       <AppBar position="static" sx={{ bgcolor: "#1D1D1D", boxShadow: 3, }} >
//         <Tabs value={currentTab} centered
//           sx={{
//             "& .MuiTab-root": {
//               fontWeight: "bold",
//               fontSize: "1rem",
//               textTransform: "none",
//               color: "#fff",
//               transition: "0.3s",
//             },

//             "& .MuiTab-root:hover:not(.Mui-selected)": {
//               color: "#b7a284",
//             },

//             "& .Mui-selected": {
//               color: "#b7a284 !important",
//             },

//             "& .MuiTabs-indicator": {
//               backgroundColor: "#b7a284",
//               height: 4,
//             },
//           }}
//         >
//           <Tab label="Студенты" component={Link} to="/students" disableRipple />
//           <Tab 
//             label="Документы" 
//             disableRipple
//             onMouseEnter={handleDocumentsHover}
//             sx={{ cursor: "pointer" }}
//           />
//         </Tabs>

//         {/* Documents Dropdown Menu */}
//         <Menu
//           anchorEl={anchorEl}
//           open={isDocumentsMenuOpen}
//           onClose={handleDocumentsLeave}
//           onMouseLeave={handleDocumentsLeave}
//           MenuListProps={{
//             onMouseLeave: handleDocumentsLeave,
//           }}
//           sx={{
//             "& .MuiPaper-root": {
//               bgcolor: "#2D2D2D",
//             },
//             "& .MuiMenuItem-root": {
//               color: "#fff",
//               fontSize: "0.95rem",
//               "&:hover": {
//                 bgcolor: "#b7a284",
//               },
//             },
//           }}
//         >
//           <MenuItem 
//             component={Link} 
//             to="/passports"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Удостоверения личности
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/visas"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Визы
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/education_documents"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Документы об образовании
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/petitions"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Ходатайства
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/medical_reports"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Медицинские заключения
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/migration_cards"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Миграционные карты
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/arrival_notifications"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Уведомления о прибытии
//           </MenuItem>
//           <MenuItem 
//             component={Link} 
//             to="/education_agreements"
//             onClick={handleDocumentsLeave}
//             sx={{fontWeight: "bold"}}
//           >
//             Договоры об образовании
//           </MenuItem>
//           <MenuItem
//             component={Link}
//             to="/termination_notifications"
//             onClick={handleDocumentsLeave}
//           >
//             <Typography
//               sx={{
//                 fontWeight: 'bold',
//                 whiteSpace: 'pre-line',
//               }}
//             >
//               Уведомления о предоставлении академического отпуска,
//               {'\n'}
//               о завершении или досрочном прекращении обучения
//             </Typography>
//           </MenuItem>

//         </Menu>
//       </AppBar>
      
//       <Box sx={{ flex: 1, width: "100%", px: 3, py: 3, minHeight: 0 }}>
//         <Outlet />
//       </Box>
//     </Box>
//   );
// };

// export default MainLayout;

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../ui/Header";

const MainLayout = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box sx={{ flex: 1, width: "100%", px: 3, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

