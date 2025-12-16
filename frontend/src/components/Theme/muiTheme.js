// muiTheme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0b3d0b", contrastText: "#fff" },
    secondary: { main: "#d4af37", contrastText: "#0b3d0b" },
    background: { default: "#f7fff7", paper: "#fff" },
    text: { primary: "#0b3d0b", secondary: "#667085" },
  },
  typography: {
    fontFamily: `"Poppins", "Noto Naskh Arabic", sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: "rgba(11,61,11,0.94)" },
      },
    },
  },
});

export default theme;
