// ✅ D:\AlMustafaApp\frontend\src\components\Theme\ThemeToggle.js
import React, { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Tooltip title={theme === "light" ? "Switch to Dark Mode 🌙" : "Switch to Light Mode ☀️"}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: theme === "light" ? "#d4af37" : "#fff",
          transition: "0.3s ease",
        }}
      >
        {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
