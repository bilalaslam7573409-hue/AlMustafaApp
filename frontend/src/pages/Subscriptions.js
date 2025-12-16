import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { motion } from "framer-motion";

export default function Subscriptions() {
  const mockCreators = [
    { name: "Sheikh Abdullah", followers: "120K", img: "https://i.pravatar.cc/100?img=15" },
    { name: "Qari Salman", followers: "89K", img: "https://i.pravatar.cc/100?img=33" },
    { name: "Mufti Hamza", followers: "75K", img: "https://i.pravatar.cc/100?img=20" },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "linear-gradient(180deg,#f7fff7 0%,#eafae7 100%)",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#0b3d0b",
          fontWeight: "bold",
          mb: 3,
          textAlign: "center",
        }}
      >
        🔔 Subscribed Creators
      </Typography>

      {mockCreators.map((creator, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "#fff",
              p: 2,
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Avatar src={creator.img} sx={{ width: 56, height: 56 }} />
            <Box>
              <Typography variant="h6" sx={{ color: "#0b3d0b" }}>
                {creator.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#777" }}>
                {creator.followers} Followers
              </Typography>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
