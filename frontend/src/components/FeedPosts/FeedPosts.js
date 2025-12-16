import React from "react";
import { Favorite, Chat, Share } from "@mui/icons-material";

export default function FeedPosts() {
  const posts = [
    {
      id: 1,
      ownerName: "Quran Reminder",
      caption: "📜 Hadith: The best among you are those who learn and teach the Quran.",
      imageUrl: "/images/hadith1.jpg",
      likes: 200,
      comments: 15,
      shares: 12
    },
    {
      id: 2,
      ownerName: "Islamic Facts",
      caption: "🌙 Allah loves those who repent and purify themselves.",
      imageUrl: "/images/dua1.jpg",
      likes: 450,
      comments: 33,
      shares: 19
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      {posts.map((p) => (
        <div key={p.id} style={{
          background: "#fff",
          borderRadius: 12,
          marginBottom: 20,
          padding: 15,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontWeight: "bold", color: "#0b3d0b" }}>@{p.ownerName}</div>
          <p style={{ color: "#333" }}>{p.caption}</p>
          <img src={p.imageUrl} alt="Post" style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button style={fbBtn}><Favorite /> {p.likes}</button>
            <button style={fbBtn}><Chat /> {p.comments}</button>
            <button style={fbBtn}><Share /> {p.shares}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const fbBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  color: "#0b3d0b",
  gap: 5
};
