// client/src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    // यूजर के रोल और अलाउड रोल्स दोनों को अपरकेस और ट्रिम करके मैच करें
    const userRole = user?.role ? String(user.role).trim().toUpperCase() : "";
    const formattedAllowedRoles = allowedRoles.map((r) => String(r).trim().toUpperCase());

    if (!formattedAllowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}