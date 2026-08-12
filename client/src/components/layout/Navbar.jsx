// client/src/components/layout/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import { useAuth } from "../../context/AuthContext";
import { DRAWER_WIDTH } from "./Sidebar";

export default function Navbar({ onMenuClick, mode, onToggleMode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isDarkMode = mode === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        // लाइट मोड में #E0F7FA (सॉफ्ट एज़्योर), डार्क मोड में #0b1120 या #131c31
        bgcolor: isDarkMode ? "#0b1120" : "#E0F7FA",
        color: isDarkMode ? "#f8fafc" : "#0f172a",
        borderBottom: "1px solid",
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 131, 143, 0.15)",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: "none" }, color: "inherit" }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
          <IconButton onClick={onToggleMode} sx={{ color: "inherit" }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.replace("_", " ")}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate("/settings"); }}>
            <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
            Account Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}