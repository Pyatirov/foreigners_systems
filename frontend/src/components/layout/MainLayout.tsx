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

