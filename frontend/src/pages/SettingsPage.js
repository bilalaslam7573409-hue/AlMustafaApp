import React from "react";
import { Box, Typography, Switch, FormControlLabel, Divider } from "@mui/material";

export default function SettingsPage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(180deg,#f7fff7 0%,#eafae7 100%)",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "#0b3d0b", fontWeight: "bold", mb: 3, textAlign: "center" }}
      >
        ⚙️ Settings
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Dark Mode"
        sx={{ color: "#0b3d0b" }}
      />
      <br />
      <FormControlLabel control={<Switch />} label="Notifications" sx={{ color: "#0b3d0b" }} />
      <br />
      <FormControlLabel control={<Switch />} label="Auto Play Videos" sx={{ color: "#0b3d0b" }} />
    </Box>
  );
}
