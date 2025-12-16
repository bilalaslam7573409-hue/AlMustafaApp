// ✅ D:\AlMustafaApp\frontend\src\components\Profile\UserProfile.js
import React from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function UserProfile({ user, onLogout }) {
  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Avatar
        src={user.photoURL}
        alt={user.displayName}
        sx={{
          width: 100,
          height: 100,
          margin: "0 auto",
          border: "3px solid #d4af37",
        }}
      />
      <Typography variant="h6" sx={{ mt: 2, color: "#0b3d0b" }}>
        {user.displayName}
      </Typography>
      <Typography sx={{ color: "#555" }}>{user.email}</Typography>

      <Button
        variant="contained"
        sx={{
          mt: 3,
          bgcolor: "#d4af37",
          color: "#0b3d0b",
          "&:hover": { bgcolor: "#0b3d0b", color: "#d4af37" },
        }}
        onClick={() => {
          signOut(auth);
          onLogout();
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
// ✅ D:\AlMustafaApp\frontend\src\components\Profile\UserProfile.js
import React from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function UserProfile({ user, onLogout }) {
  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Avatar
        src={user.photoURL}
        alt={user.displayName}
        sx={{
          width: 100,
          height: 100,
          margin: "0 auto",
          border: "3px solid #d4af37",
        }}
      />
      <Typography variant="h6" sx={{ mt: 2, color: "#0b3d0b" }}>
        {user.displayName}
      </Typography>
      <Typography sx={{ color: "#555" }}>{user.email}</Typography>

      <Button
        variant="contained"
        sx={{
          mt: 3,
          bgcolor: "#d4af37",
          color: "#0b3d0b",
          "&:hover": { bgcolor: "#0b3d0b", color: "#d4af37" },
        }}
        onClick={() => {
          signOut(auth);
          onLogout();
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
