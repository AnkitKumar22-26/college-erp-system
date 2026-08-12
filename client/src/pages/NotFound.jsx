// client/src/pages/NotFound.jsx
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Typography variant="h1" sx={{ fontWeight: 800, fontSize: 96, color: "primary.main" }}>404</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Page not found</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>The page you're looking for doesn't exist or has been moved.</Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
    </Box>
  );
}
