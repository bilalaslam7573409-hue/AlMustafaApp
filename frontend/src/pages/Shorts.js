import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import VideoFeed from "../components/VideoFeed/VideoFeed";

export default function Shorts() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "linear-gradient(180deg, #fffef7 0%, #f3faea 100%)",
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#0b3d0b",
            textAlign: "center",
            mb: 2,
            textShadow: "0 0 10px rgba(212,175,55,0.5)",
          }}
        >
          🎬 Shorts Section
        </Typography>
        <Typography
          sx={{
            color: "#444",
            textAlign: "center",
            mb: 4,
          }}
        >
          Watch short, impactful Islamic clips that inspire your day 🌙
        </Typography>
      </motion.div>

      <VideoFeed />
    </Box>
  );
}
