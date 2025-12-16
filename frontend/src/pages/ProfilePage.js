import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const user = {
    name: "Bilal Aslam",
    email: "bilal@example.com",
    img: "https://i.pravatar.cc/200?img=5",
    followers: 1320,
    following: 478,
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg,#f7fff7 0%,#eafae7 100%)",
        minHeight: "100vh",
        p: 3,
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Avatar
          src={user.img}
          sx={{
            width: 120,
            height: 120,
            margin: "20px auto",
            boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
          }}
        />
        <Typography variant="h5" sx={{ color: "#0b3d0b", fontWeight: "bold" }}>
          {user.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "#555" }}>
          {user.email}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, my: 3 }}>
          <Typography variant="body1" sx={{ color: "#0b3d0b" }}>
            <strong>{user.followers}</strong> Followers
          </Typography>
          <Typography variant="body1" sx={{ color: "#0b3d0b" }}>
            <strong>{user.following}</strong> Following
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            bgcolor: "#0b3d0b",
            color: "#d4af37",
            px: 4,
            "&:hover": { bgcolor: "#d4af37", color: "#0b3d0b" },
          }}
        >
          Edit Profile
        </Button>
      </motion.div>
    </Box>
  );
}
