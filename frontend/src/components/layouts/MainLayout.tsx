
import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed
    ? COLLAPSED_WIDTH
    : EXPANDED_WIDTH;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAF8F7",
      }}
    >
      <Header />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((value) => !value)
        }
      />

      <Box
        component="main"
        sx={{
          ml: `${sidebarWidth}px`,
          minHeight: "calc(100vh - 80px)",
          p: { xs: 2, md: 3, lg: 4 },
          boxSizing: "border-box",
          transition: "margin-left 0.22s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
