import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { motion } from "framer-motion";

export default function Notifications() {
  const notifications = [
    "💖 Someone liked your video ‘Beautiful Recitation’",
    "🧕 New follower: Ayesha Khan started following you",
    "📤 Your upload was successfully published",
    "🌟 You earned 50 new likes today",
  ];

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
        🔔 Notifications
      </Typography>

      <List>
        {notifications.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <ListItem
              sx={{
                background: "#fff",
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              }}
            >
              <ListItemText primary={text} sx={{ color: "#0b3d0b" }} />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Box>
  );
}
