// client/src/components/layout/Layout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ mode, onToggleMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDarkMode = mode === "dark";

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar onMenuClick={() => setMobileOpen(true)} mode={mode} onToggleMode={onToggleMode} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: "100vh",
          // यहाँ #E0F7FA (Soft Azure) लगाया गया है जो साइडबार के साथ परफेक्ट मैच करेगा
          bgcolor: isDarkMode ? "#0b1120" : "#E0F7FA",
          color: isDarkMode ? "#f8fafc" : "#0f172a",
          transition: "background-color 0.3s ease",
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}