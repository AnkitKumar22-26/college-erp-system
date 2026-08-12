// client/src/components/layout/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillageOutlined";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBusOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeekOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";
import WorkIcon from "@mui/icons-material/WorkOutlineOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceOutlined";
import SummarizeIcon from "@mui/icons-material/SummarizeOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import { useAuth } from "../../context/AuthContext";

export const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, roles: null },
  { label: "Students", path: "/students", icon: <SchoolIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "RECEPTIONIST"] },
  { label: "Faculty", path: "/faculty", icon: <PeopleIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD"] },
  { label: "Departments", path: "/departments", icon: <ApartmentIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD"] },
  { label: "Attendance", path: "/attendance", icon: <EventAvailableIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT"] },
  { label: "Attendance Report", path: "/attendance/report", icon: <SummarizeIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD", "FACULTY"] },
  { label: "Examination", path: "/exams", icon: <AssignmentIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT"] },
  { label: "Fees", path: "/fees", icon: <PaymentsIcon />, roles: ["ADMIN", "PRINCIPAL", "ACCOUNTANT"] },
  { label: "Library", path: "/library", icon: <MenuBookIcon />, roles: ["ADMIN", "PRINCIPAL", "LIBRARIAN"] },
  { label: "Hostel", path: "/hostel", icon: <HolidayVillageIcon />, roles: ["ADMIN", "PRINCIPAL", "RECEPTIONIST"] },
  { label: "Transport", path: "/transport", icon: <DirectionsBusIcon />, roles: ["ADMIN", "PRINCIPAL", "RECEPTIONIST"] },
  { label: "Notice Board", path: "/notices", icon: <CampaignIcon />, roles: null },
  { label: "Timetable", path: "/timetable", icon: <CalendarViewWeekIcon />, roles: null },
  { label: "Leave Management", path: "/leaves", icon: <EventBusyIcon />, roles: null },
  { label: "Placements", path: "/placements", icon: <WorkIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT"] },
  { label: "Accounts", path: "/accounts", icon: <AccountBalanceIcon />, roles: ["ADMIN", "PRINCIPAL", "ACCOUNTANT"] },
  { label: "Reports", path: "/reports", icon: <SummarizeIcon />, roles: ["ADMIN", "PRINCIPAL", "HOD"] },
  { label: "Settings", path: "/settings", icon: <SettingsIcon />, roles: ["ADMIN", "PRINCIPAL"] },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const userRole = user?.role ? String(user.role).trim().toUpperCase() : "";

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.map((r) => r.toUpperCase()).includes(userRole);
  });

  const content = (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        bgcolor: isDarkMode ? "#131c31" : "#e0f7fa", 
        color: isDarkMode ? "#93c5fd" : "#0f172a"
      }}
    >
      <Toolbar sx={{ px: 3, minHeight: "70px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              background: isDarkMode 
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                : "linear-gradient(135deg, #00acc1 0%, #00838f 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              boxShadow: isDarkMode ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "0 4px 12px rgba(0, 131, 143, 0.25)",
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            CE
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              fontSize: "1.1rem", 
              color: isDarkMode ? "#ffffff" : "#006064", 
              letterSpacing: "-0.5px" 
            }}
          >
            College ERP
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 131, 143, 0.15)" }} />
      <List sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 0.6 }}>
        {visibleItems.map((item) => {
          const targetPath = (item.path === "/attendance" && userRole === "STUDENT") 
            ? "/attendance/my-attendance" 
            : item.path;

          // यहाँ Exact Match का लॉजिक लगा दिया गया है ताकि दोनों एक साथ हाईलाइट न हों
          const selected = targetPath === "/attendance"
            ? location.pathname === "/attendance"
            : location.pathname.startsWith(targetPath);

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(targetPath);
                if (onClose) onClose();
              }}
              sx={{
                borderRadius: "10px",
                py: 1.1,
                px: 2,
                transition: "all 0.2s ease-in-out",
                color: isDarkMode ? "#94a3b8" : "#334155",
                "&:hover": {
                  bgcolor: isDarkMode ? "rgba(59, 130, 246, 0.12)" : "rgba(0, 172, 193, 0.12)",
                  color: isDarkMode ? "#60a5fa" : "#00838f",
                  transform: "translateX(4px)",
                  "& .MuiListItemIcon-root": { color: isDarkMode ? "#60a5fa" : "#00838f" }
                },
                "&.Mui-selected": {
                  background: isDarkMode 
                    ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                    : "linear-gradient(135deg, #00acc1 0%, #00838f 100%)",
                  color: "#fff",
                  boxShadow: isDarkMode ? "0 4px 12px rgba(59, 130, 246, 0.35)" : "0 4px 12px rgba(0, 131, 143, 0.3)",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                  "&:hover": {
                    background: isDarkMode 
                      ? "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)" 
                      : "linear-gradient(135deg, #00838f 0%, #006064 100%)",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selected ? "#fff" : (isDarkMode ? "#64748b" : "#475569"), transition: "color 0.2s" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ 
                  fontSize: 13.5, 
                  fontWeight: selected ? 700 : 500,
                  letterSpacing: "-0.2px"
                }} 
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 131, 143, 0.15)",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.03)",
          },
        }}
        open
      >
        {content}
      </Drawer>
    </>
  );
}