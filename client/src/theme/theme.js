// client/src/theme/theme.js
import { createTheme } from "@mui/material/styles";

// Design tokens
const tokens = {
  indigo: "#4338CA",
  indigoDark: "#312E81",
  teal: "#0D9488",
  amber: "#D97706",
  rose: "#E11D48",
  softAzure: "#E0F7FA", // हमारा नया सॉफ्ट एज़्योर बैकग्राउंड कलर
  slate700: "#334155",
  slate900: "#0F172A",
};

export const buildTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
      primary: { main: tokens.indigo, dark: tokens.indigoDark, contrastText: "#fff" },
      secondary: { main: tokens.teal, contrastText: "#fff" },
      warning: { main: tokens.amber },
      error: { main: tokens.rose },
      background: {
        default: mode === "dark" ? "#0B1120" : tokens.softAzure, // लाइट मोड में अब सॉफ्ट एज़्योर रहेगा
        paper: mode === "dark" ? "#111827" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#E2E8F0" : tokens.slate900,
        secondary: mode === "dark" ? "#94A3B8" : tokens.slate700,
      },
      divider: mode === "dark" ? "#1E293B" : "rgba(0, 131, 143, 0.15)",
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
      h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 8, boxShadow: "none" } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiCard: {
        styleOverrides: {
          root: { 
            borderRadius: 14, 
            border: `1px solid ${mode === "dark" ? "#1E293B" : "rgba(255, 255, 255, 0.6)"}`,
            boxShadow: mode === "dark" ? "none" : "0 4px 20px rgba(0, 131, 143, 0.08)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: { root: { boxShadow: "none" } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
    },
  });

export default tokens;