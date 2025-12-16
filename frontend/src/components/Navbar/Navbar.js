import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartTheme from "../Theme/SmartTheme";

export default function Navbar({ value, onChange, showThemeWidget }) {
  return (
    <>
      {/* 🔝 SmartTheme Widget (only if enabled in Settings) */}
      {showThemeWidget && (
        <Box
          sx={{
            position: "fixed",
            top: 8,
            right: 10,
            zIndex: 999,
            background: "rgba(11,61,11,0.8)",
            borderRadius: "14px",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          <SmartTheme />
        </Box>
      )}

      {/* 🔘 Bottom Navigation */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "2px solid #d4af37",
          bgcolor: "#0b3d0b",
        }}
        elevation={5}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(e, newValue) => onChange(newValue)}
          sx={{ bgcolor: "#0b3d0b", color: "white" }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} sx={{ color: "white" }} />
          <BottomNavigationAction label="Images" icon={<VideoLibraryIcon />} sx={{ color: "white" }} />
          <BottomNavigationAction label="Upload" icon={<AddCircleIcon />} sx={{ color: "#d4af37" }} />
          <BottomNavigationAction label="Subs" icon={<SubscriptionsIcon />} sx={{ color: "white" }} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} sx={{ color: "white" }} />
        </BottomNavigation>
      </Paper>
    </>
  );
}
