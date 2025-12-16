// D:\AlMustafaApp\frontend\src\styles\theme.mui.js
import { createTheme } from "@mui/material/styles";

const base = {
  palette: {
    primary: { main: "#0b3d0b", contrastText: "#fff" },
    secondary: { main: "#d4af37", contrastText: "#0b3d0b" },
    info: { main: "#007bff" },
    success: { main: "#2e7d32" },
    error: { main: "#d32f2f" },
    background: { default: "#f7fff7", paper: "#ffffff" },
    text: { primary: "#0b3d0b", secondary: "#667085" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins","Noto Naskh Arabic", sans-serif',
    h5: { fontWeight: 700 },
  },
  components: {
    MuiAppBar: { defaultProps: { elevation: 3 } },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 12, fontWeight: 600 },
        containedPrimary: { backgroundColor: "#d4af37", color: "#0b3d0b" },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { background: "rgba(255,255,255,0.6)" } },
    },
  },
};

export default createTheme(base);
