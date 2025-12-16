// ✅ D:\AlMustafaApp\frontend\src\components\VideoFeed\VideoFeed.js
import React, { useState, useRef, useEffect } from "react";
import VideoCard from "./VideoCard";

/*
 VideoFeed:
 - full-screen vertical stack
 - swipe-up / swipe-down to change active video (mobile touch)
 - keyboard arrow support
 - prefetch next video by creating <link rel="preload"> (basic)
*/

export default function VideoFeed({ posts: initialPosts }) {
  // Example: if no posts passed, fallback sample
  const sample = initialPosts || [
    { id: "1", type: "video", ownerName: "Al Mustafa", caption: "Short 1", publishedUrl: "/sample1.mp4", likes: 10, comments: 2, shares: 1 },
    { id: "2", type: "video", ownerName: "Al Mustafa", caption: "Short 2", publishedUrl: "/sample2.mp4", likes: 23, comments: 5, shares: 3 },
    { id: "3", type: "video", ownerName: "Al Mustafa", caption: "Short 3", publishedUrl: "/sample3.mp4", likes: 7, comments: 1, shares: 0 },
  ];

  const posts = initialPosts && initialPosts.length ? initialPosts : sample;

  const [index, setIndex] = useState(0);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  useEffect(() => {
    // prefetch next video
    const next = posts[index + 1];
    if (next && next.publishedUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = next.publishedUrl;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [index, posts]);

  const goNext = () => {
    setIndex((i) => Math.min(posts.length - 1, i + 1));
  };
  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  // touch handlers
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = touchStartY.current;
  };
  const onTouchMove = (e) => {
    touchCurrentY.current = e.touches[0].clientY;
  };
  const onTouchEnd = () => {
    const dy = touchStartY.current - touchCurrentY.current;
    if (Math.abs(dy) > 60) {
      if (dy > 0) goNext();
      else goPrev();
    }
  };

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowUp") goPrev();
      if (e.key === "ArrowDown") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 12,
        paddingBottom: 120,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {posts.map((p, idx) => (
        <div
          key={p.id}
          style={{
            display: idx === index ? "block" : "none",
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
          }}
        >
          <VideoCard post={p} autoPlay={idx === index} />
        </div>
      ))}

      {/* small controls to move manually (useful for desktop) */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
        <button onClick={goPrev} style={{ padding: "8px 12px", borderRadius: 8 }}>◀ Prev</button>
        <div style={{ alignSelf: "center", fontWeight: 700 }}>{index + 1} / {posts.length}</div>
        <button onClick={goNext} style={{ padding: "8px 12px", borderRadius: 8 }}>Next ▶</button>
      </div>
    </div>
  );
}
