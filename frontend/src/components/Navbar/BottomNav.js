// ✅ D:\AlMustafaApp\frontend\src\components\Navbar\BottomNav.js
import React, { useState } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ImageIcon from "@mui/icons-material/Image";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function BottomNav({ onNavigate }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const paths = ["/", "/images", "/upload", "/subs", "/profile"];
    onNavigate(paths[newValue]);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "2px solid #d4af37",
        zIndex: 10,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
      }}
      elevation={5}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          "& .Mui-selected": {
            color: "#007bff", // blue selected
          },
          "& .MuiBottomNavigationAction-label.Mui-selected": {
            fontWeight: "bold",
            color: "#007bff",
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Images" icon={<ImageIcon />} />
        <BottomNavigationAction label="Upload" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="Subs" icon={<SubscriptionsIcon />} />
        <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
