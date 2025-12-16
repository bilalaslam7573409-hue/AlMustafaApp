// D:\AlMustafaApp\frontend\src\components\Login.js

import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { Box, Button, Typography } from "@mui/material";

export default function Login({ onLogin }) {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user);
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed! Please try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f9fff9",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: "#0b3d0b",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        🌙 Al Mustafa Online Quran Academy
      </Typography>

      <Button
        onClick={handleLogin}
        variant="contained"
        sx={{
          bgcolor: "#0b3d0b",
          color: "#fff",
          fontSize: "16px",
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          "&:hover": {
            bgcolor: "#125c12",
          },
        }}
      >
        Continue with Google
      </Button>
    </Box>
  );
}
