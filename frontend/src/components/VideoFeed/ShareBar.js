// ✅ ShareBar.js — Stage 7 (Ultra Viral Share System)

import React from "react";
import { rewardEndpoint } from "../../index";

const ShareBar = ({ postId, userId, videoUrl }) => {
  const shareTo = async (platform) => {
    const text = "Watch this amazing Islamic short video — Al Mustafa Quran Academy";
    const shareUrl = `https://almustafa.app/watch/${postId}`;

    let finalUrl = "";

    switch (platform) {
      case "whatsapp":
        finalUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`;
        break;
      case "facebook":
        finalUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "telegram":
        finalUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
      case "instagram":
        alert("Instagram does not support direct link-sharing. Copy URL!");
        finalUrl = shareUrl;
        break;
    }

    window.open(finalUrl, "_blank");

    // Reward User for Sharing
    await fetch(rewardEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        postId,
        coins: 20,
        type: "share"
      })
    });
  };

  return (
    <div style={{ display: "flex", gap: 15, marginTop: 10 }}>
      <button onClick={() => shareTo("whatsapp")}>WhatsApp</button>
      <button onClick={() => shareTo("facebook")}>Facebook</button>
      <button onClick={() => shareTo("telegram")}>Telegram</button>
      <button onClick={() => shareTo("instagram")}>Instagram</button>
    </div>
  );
};

export default ShareBar;
