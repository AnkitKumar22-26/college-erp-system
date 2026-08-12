// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #4338CA 0%, #312E81 45%, #0B1120 100%)",
        p: 2,
      }}
    >
      <Grid container maxWidth="lg" sx={{ boxShadow: 10, borderRadius: 4, overflow: "hidden" }}>
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            p: 6,
            color: "#fff",
            background: "linear-gradient(160deg, #4338CA 0%, #312E81 100%)",
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
            College ERP System
          </Typography>
          <Typography sx={{ opacity: 0.85 }}>
            One connected platform for admissions, academics, attendance, fees, and every
            department in between.
          </Typography>
        </Grid>

        <Grid item xs={12} md={7} sx={{ bgcolor: "background.paper" }}>
          <Box sx={{ p: { xs: 4, sm: 6 } }} component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Sign in
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Enter your credentials to access your dashboard
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.3, fontWeight: 700 }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Paper variant="outlined" sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: "background.default" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700 }}>
                Sample credentials (seeded)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                admin@erp.com &middot; principal@erp.com &middot; hod.cse@erp.com &middot;
                faculty@erp.com &middot; student@erp.com &middot; accountant@erp.com &middot;
                librarian@erp.com &middot; receptionist@erp.com
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Password: <strong>Password@123</strong>
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
