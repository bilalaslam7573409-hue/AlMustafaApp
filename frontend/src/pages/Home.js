import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import VideoFeed from "../components/VideoFeed/VideoFeed";

export default function Home() {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "linear-gradient(180deg, #f7fff7 0%, #eafae7 100%)",
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0b3d0b",
            textAlign: "center",
            mb: 2,
            textShadow: "0 0 10px rgba(212,175,55,0.5)",
          }}
        >
          🎥 Welcome to Al Mustafa Feed
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#333",
            textAlign: "center",
            mb: 4,
            fontSize: 18,
          }}
        >
          Explore trending, inspiring and beautiful Islamic short videos from
          creators around the world 🌍
        </Typography>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <VideoFeed />
      </motion.div>

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#0b3d0b",
            color: "#d4af37",
            fontWeight: "bold",
            borderRadius: "12px",
            px: 4,
            py: 1.5,
            "&:hover": {
              bgcolor: "#d4af37",
              color: "#0b3d0b",
            },
          }}
        >
          Discover More Videos
        </Button>
      </Box>
    </Box>
  );
}
