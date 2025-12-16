// ✅ D:\AlMustafaApp\frontend\src\App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

// 🧩 Components
import Navbar from "./components/Navbar/Navbar";
import BottomNav from "./components/Navbar/BottomNav";
import Login from "./components/Auth/Login";
import VideoFeed from "./components/VideoFeed/VideoFeed";
import UploadPost from "./components/UploadPost/UploadPost";

// 🧭 Extra Pages
import Home from "./pages/Home";
import Shorts from "./pages/Shorts";
import Subscriptions from "./pages/Subscriptions";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Notifications from "./components/Notifications/Notifications";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Add state for theme widget toggle
  const [showThemeWidget, setShowThemeWidget] = useState(
    localStorage.getItem("showThemeWidget") === "true"
  );

  // 🔐 Listen for Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ⏳ Loader while checking login
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
        <CircularProgress />
      </Box>
    );

  // 🧩 If not logged in
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  // 🚪 Logout
  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <Box sx={{ bgcolor: "#f7fff7", minHeight: "100vh" }}>
      {/* ✅ Top AppBar */}
      <AppBar
        position="static"
        sx={{
          bgcolor: "rgba(11,61,11,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "2px solid #d4af37",
          boxShadow: "0 6px 18px rgba(212, 175, 55, 0.15)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ color: "#d4af37", fontWeight: "bold", letterSpacing: 0.5 }}
          >
            🕌 Al Mustafa App
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={user.photoURL}
              alt={user.displayName}
              sx={{ border: "2px solid #d4af37" }}
            />
            <Typography variant="body1" sx={{ color: "white" }}>
              {user.displayName}
            </Typography>
            <Button
              onClick={handleLogout}
              variant="contained"
              sx={{
                bgcolor: "#d4af37",
                color: "#0b3d0b",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#c6a23a" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🕌 Navbar (SmartTheme integrated) */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        showThemeWidget={showThemeWidget}
      />

      {/* 📲 Main Pages */}
      <Box sx={{ p: 0, pb: 9 }}>
        <Routes>
          {/* 🏠 Home */}
          <Route
            path="/"
            element={
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#0b3d0b", fontWeight: "bold", mb: 2 }}
                >
                  🎥 Home Feed
                </Typography>
                <VideoFeed />
              </Box>
            }
          />

          {/* 🎬 Shorts */}
          <Route path="/shorts" element={<Shorts />} />

          {/* ➕ Upload */}
          <Route
            path="/upload"
            element={
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#0b3d0b", fontWeight: "bold", mb: 2 }}
                >
                  ➕ Upload Your Video
                </Typography>
                <UploadPost />
              </Box>
            }
          />

          {/* 🔔 Subscriptions */}
          <Route
            path="/subs"
            element={
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#0b3d0b", fontWeight: "bold", mb: 2 }}
                >
                  🔔 Subscriptions
                </Typography>
                <Typography>
                  You will soon see posts from your followed creators here.
                </Typography>
              </Box>
            }
          />

          {/* 👤 Profile */}
          <Route
            path="/profile"
            element={
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#0b3d0b", fontWeight: "bold", mb: 2 }}
                >
                  👤 {user.displayName}’s Profile
                </Typography>
                <Typography>Email: {user.email}</Typography>
              </Box>
            }
          />

          {/* ⚙️ Settings (with control for SmartTheme) */}
          <Route
            path="/settings"
            element={
              <SettingsPage
                showThemeWidget={showThemeWidget}
                setShowThemeWidget={setShowThemeWidget}
              />
            }
          />

          {/* 🔔 Notifications */}
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Box>

      {/* 🔘 Bottom Navigation */}
      <BottomNav
        onNavigate={(path) => {
          navigate(path);
        }}
      />
    </Box>
  );
}

export default App;
