// ✅ D:\AlMustafaApp\frontend\src\components\Theme\SmartTheme.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  IconButton,
  Tooltip,
  Switch,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

export default function SmartTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [autoMode, setAutoMode] = useState(localStorage.getItem("autoMode") === "true");
  const [azanNotify, setAzanNotify] = useState(localStorage.getItem("azanNotify") === "true");
  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [popup, setPopup] = useState(null);
  const [nextPrayer, setNextPrayer] = useState("");
  const [countdown, setCountdown] = useState("");

  // 🕌 Fetch prayer times (with auto-refresh every 1 hour)
  useEffect(() => {
    if (!city) return;
    const fetchTimes = async () => {
      try {
       // 🕌 Fetch prayer times (Hanafi - method=1, school=1)
const res = await axios.get(
  `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1&school=1`
);

        setPrayerTimes(res.data.data.timings);
      } catch (err) {
        console.error("Prayer time fetch error:", err);
      }
    };
    fetchTimes();

    const interval = setInterval(fetchTimes, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  // 🔄 Auto theme + Azan reminder logic
  useEffect(() => {
    if (!prayerTimes) return;

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Determine theme
    const sunrise = toMinutes(prayerTimes.Sunrise);
    const maghrib = toMinutes(prayerTimes.Maghrib);
    if (autoMode) {
      if (currentMinutes >= maghrib || currentMinutes < sunrise) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }

    // 🔔 Azan notify popup
    if (azanNotify) {
      prayers.forEach((name) => {
        const diff = Math.abs(currentMinutes - toMinutes(prayerTimes[name]));
        if (diff === 0) {
          setPopup(`🕌 ${name} time has started`);
          setTimeout(() => setPopup(null), 8000);
        }
      });
    }

    // ⏳ Find next prayer
    for (let i = 0; i < prayers.length; i++) {
      const pTime = toMinutes(prayerTimes[prayers[i]]);
      if (pTime > currentMinutes) {
        setNextPrayer(prayers[i]);
        const mins = pTime - currentMinutes;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        setCountdown(`${h > 0 ? `${h}h ` : ""}${m}m left`);
        return;
      }
    }
    setNextPrayer("Fajr (Tomorrow)");
    setCountdown("");
  }, [prayerTimes, autoMode, azanNotify]);

  // 🧠 Apply theme
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 💾 Save preferences
  useEffect(() => {
    localStorage.setItem("autoMode", autoMode);
    localStorage.setItem("azanNotify", azanNotify);
  }, [autoMode, azanNotify]);

  // 🌍 Ask city once (editable by click)
  const handleCity = () => {
    const userCity = prompt("اپنا شہر درج کریں (مثلاً: Bhalwal)");
    if (userCity) {
      setCity(userCity);
      localStorage.setItem("city", userCity);
    }
  };

  // 🪄 Loading State
  if (!city)
    return (
      <Tooltip title="Set your city">
        <IconButton onClick={handleCity} sx={{ color: "#fff" }}>
          <LocationOnIcon />
        </IconButton>
      </Tooltip>
    );

  if (!prayerTimes)
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#fff" }}>
        <CircularProgress size={16} sx={{ color: "#d4af37" }} /> Loading...
      </Box>
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          background: "rgba(11,61,11,0.65)",
          border: "1px solid rgba(212,175,55,0.25)",
          px: 1.5,
          py: 0.7,
          borderRadius: "16px",
          boxShadow: "0 0 15px rgba(212,175,55,0.25)",
          backdropFilter: "blur(8px)",
          animation: "goldPulse 2.5s infinite ease-in-out",
        }}
      >
        {/* 🌙/☀️ Theme */}
        <Tooltip title={theme === "light" ? "Dark Mode" : "Light Mode"}>
          <IconButton
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            sx={{ color: theme === "light" ? "#d4af37" : "#fff" }}
          >
            {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        {/* Auto toggle */}
        <Tooltip title="Auto Theme (by prayer time)">
          <Switch
            checked={autoMode}
            onChange={(e) => setAutoMode(e.target.checked)}
            color="success"
          />
        </Tooltip>

        {/* Silent Azan Reminder */}
        <Tooltip title="Silent Azan Reminder">
          <IconButton
            onClick={() => setAzanNotify(!azanNotify)}
            sx={{ color: azanNotify ? "#d4af37" : "#ccc" }}
          >
            {azanNotify ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
          </IconButton>
        </Tooltip>

        {/* 📍 City */}
        <Typography
          onClick={handleCity}
          sx={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
          {city}
        </Typography>

        {/* ⏳ Next prayer info */}
        {nextPrayer && (
          <Typography sx={{ color: "#d4af37", fontSize: 12, ml: 1 }}>
            {nextPrayer}: {countdown}
          </Typography>
        )}
      </Box>

      {/* 🔔 Popup */}
      {popup && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "15px",
            background: "rgba(11,61,11,0.95)",
            color: "#fff",
            border: "2px solid #d4af37",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            zIndex: 2000,
            fontWeight: 600,
          }}
        >
          {popup}
        </div>
      )}
    </>
  );
}

/* 💫 CSS Animation (Add this to theme.css bottom if not exist)
@keyframes goldPulse {
  0% { box-shadow: 0 0 10px rgba(212,175,55,0.15); }
  50% { box-shadow: 0 0 25px rgba(212,175,55,0.45); }
  100% { box-shadow: 0 0 10px rgba(212,175,55,0.15); }
}
*/
