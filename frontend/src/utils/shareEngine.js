// shareEngine.js — Smart Tracking Layer

export const trackShare = async (postId, platform, userId) => {
  await fetch("https://us-central1-al-mustafa-onlin-quran-academy.cloudfunctions.net/viralBoost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId,
      userId,
      platform,
    }),
  });
};
