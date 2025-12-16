// ✅ D:\AlMustafaApp\frontend\src\components\Auth\Login.js
import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { Box, Paper, Typography, Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function Login({ onLogin }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user);
    } catch (error) {
      console.error("⚠️ Login Error:", error);
      alert("Login failed. Please check your connection or try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #f7fff7, #eafae7)",
        color: "#0b3d0b",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 5,
          textAlign: "center",
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0b3d0b", mb: 1 }}>
          🕌 Welcome to Al Mustafa App
        </Typography>

        <Typography sx={{ color: "#555", mb: 3 }}>
          Share Islamic posts, spread light, and earn rewards ✨
        </Typography>

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            bgcolor: "#d4af37",
            color: "#0b3d0b",
            fontWeight: "bold",
            px: 3,
            py: 1.2,
            borderRadius: 2,
            "&:hover": {
              bgcolor: "#0b3d0b",
              color: "#d4af37",
              transform: "scale(1.05)",
            },
            transition: "0.3s ease",
          }}
        >
          Continue with Google
        </Button>
      </Paper>
    </Box>
  );
}
