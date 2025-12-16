// ✅ D:\AlMustafaApp\frontend\src\components\VideoFeed\VideoCard.js
import React, { useState, useRef, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

/*
 Advanced VideoCard:
 - single tap play/pause
 - double tap like (heart animation)
 - long-press left/right to skip 5s continuously
 - clickable progress overlay + small draggable seek
 - auto-hide controls after idle
 - volume and brightness gesture (vertical swipes on right/left)
 - keyboard support: Space toggle play, ArrowLeft/Right skip 5s
 - responsive and mobile friendly
*/

export default function VideoCard({ post, autoPlay = false }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [liked, setLiked] = useState(!!post.liked);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // advanced gestures
  const [volume, setVolume] = useState(1); // 0..1
  const [brightness, setBrightness] = useState(1); // css filter scale 0.4..1.4
  const gestureRef = useRef({ startY: 0, startX: 0, side: null, startVolume: 1, startBrightness: 1 });
  const pressInterval = useRef(null);

  // play / pause
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  // double tap => like
  let lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // double
      if (!liked) {
        setLiked(true);
        setLikeCount((p) => p + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    } else {
      // single (toggle) - but debounce to avoid interfering with double
      setTimeout(() => {
        // ensure no double
        if (Date.now() - lastTap.current >= 300) {
          togglePlay();
        }
      }, 320);
    }
    lastTap.current = now;
  };

  // manual like button
  const handleLikeClick = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((p) => Math.max(0, p - 1));
    } else {
      setLiked(true);
      setLikeCount((p) => p + 1);
    }
    resetHideTimer();
  };

  // skip seconds safely
  const skip = (sec) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.currentTime)) return;
    let t = v.currentTime + sec;
    t = Math.max(0, Math.min(v.duration || 999999, t));
    v.currentTime = t;
    setCurrentTime(t);
    resetHideTimer();
  };

  // left/right long press
  const handlePressStart = (direction) => {
    // direction: "back" | "forward"
    if (pressInterval.current) clearInterval(pressInterval.current);
    pressInterval.current = setInterval(() => skip(direction === "forward" ? 5 : -5), 300);
  };
  const handlePressEnd = () => {
    if (pressInterval.current) {
      clearInterval(pressInterval.current);
      pressInterval.current = null;
    }
  };

  // progress updates
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onLoaded = () => setDuration(v.duration || 0);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  // auto-hide controls
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") skip(5);
      else if (e.code === "ArrowLeft") skip(-5);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // progress click / seek
  const onSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const v = videoRef.current;
    if (v && isFinite(v.duration)) {
      v.currentTime = pct * v.duration;
      setCurrentTime(v.currentTime);
    }
    resetHideTimer();
  };

  // touch gestures (volume & brightness)
  const onTouchStart = (e) => {
    resetHideTimer();
    const touch = e.touches[0];
    gestureRef.current.startY = touch.clientY;
    gestureRef.current.startX = touch.clientX;
    const w = window.innerWidth;
    gestureRef.current.side = touch.clientX > w * 0.6 ? "right" : touch.clientX < w * 0.4 ? "left" : "middle";
    gestureRef.current.startVolume = volume;
    gestureRef.current.startBrightness = brightness;
  };

  const onTouchMove = (e) => {
    const touch = e.touches[0];
    const dy = gestureRef.current.startY - touch.clientY; // upward -> positive
    const delta = dy / window.innerHeight; // fractional
    if (gestureRef.current.side === "right") {
      // volume adjust
      const newVol = Math.max(0, Math.min(1, gestureRef.current.startVolume + delta));
      setVolume(newVol);
      if (videoRef.current) videoRef.current.volume = newVol;
    } else if (gestureRef.current.side === "left") {
      // brightness adjust
      const newB = Math.max(0.4, Math.min(1.4, gestureRef.current.startBrightness + delta));
      setBrightness(newB);
    }
    // middle: ignore (could be progress)
  };

  // apply brightness via container style (filter)
  const videoContainerStyle = {
    filter: `brightness(${brightness})`,
    transition: "filter 120ms linear",
  };

  // mouse gestures for desktop volume/brightness (optional)
  const onMouseDownGesture = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientX > rect.left + (rect.width * 0.6) ? "right" : e.clientX < rect.left + (rect.width * 0.4) ? "left" : "middle";
    gestureRef.current.side = side;
    gestureRef.current.startY = e.clientY;
    gestureRef.current.startVolume = volume;
    gestureRef.current.startBrightness = brightness;
    window.addEventListener("mousemove", onMouseMoveGesture);
    window.addEventListener("mouseup", onMouseUpGesture);
  };
  const onMouseMoveGesture = (e) => {
    const dy = gestureRef.current.startY - e.clientY;
    const delta = dy / window.innerHeight;
    if (gestureRef.current.side === "right") {
      const newVol = Math.max(0, Math.min(1, gestureRef.current.startVolume + delta));
      setVolume(newVol);
      if (videoRef.current) videoRef.current.volume = newVol;
    } else if (gestureRef.current.side === "left") {
      const newB = Math.max(0.4, Math.min(1.4, gestureRef.current.startBrightness + delta));
      setBrightness(newB);
    }
  };
  const onMouseUpGesture = () => {
    window.removeEventListener("mousemove", onMouseMoveGesture);
    window.removeEventListener("mouseup", onMouseUpGesture);
  };

  // cleanup press interval on unmount
  useEffect(() => {
    return () => {
      if (pressInterval.current) clearInterval(pressInterval.current);
    };
  }, []);

  // initial autoplay if asked
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [autoPlay]);

  return (
    <div
      className="video-card card"
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "18px auto",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        background: "#000",
      }}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* video container with brightness */}
      <div
        style={{ position: "relative", height: 640, ...videoContainerStyle }}
        onMouseDown={onMouseDownGesture}
        onTouchStart={(e) => { onTouchStart(e); }}
        onTouchMove={(e) => onTouchMove(e)}
      >
        <video
          ref={videoRef}
          src={post.publishedUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onClick={handleTap}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
        />

        {/* overlay: double-tap heart */}
        {showHeart && (
          <FavoriteIcon
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%) scale(1.2)",
              fontSize: 120,
              color: "rgba(255,0,0,0.9)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        )}

        {/* floating right actions (video) */}
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            zIndex: 25,
          }}
        >
          <div onClick={handleLikeClick} style={{ cursor: "pointer", textAlign: "center" }}>
            <FavoriteIcon style={{ fontSize: 36, color: liked ? "red" : "#fff" }} />
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{likeCount}</div>
          </div>
          <div style={{ cursor: "pointer", textAlign: "center" }}>
            <ChatBubbleOutlineIcon style={{ fontSize: 34, color: "#fff" }} />
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{post.comments || 0}</div>
          </div>
          <div style={{ cursor: "pointer", textAlign: "center" }}>
            <ShareIcon style={{ fontSize: 34, color: "#fff" }} />
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{post.shares || 0}</div>
          </div>
        </div>

        {/* left & right press areas for skip */}
        <div
          onMouseDown={() => handlePressStart("back")}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={() => handlePressStart("back")}
          onTouchEnd={handlePressEnd}
          style={{ position: "absolute", left: 0, top: 0, width: "38%", height: "100%", zIndex: 20 }}
        />
        <div
          onMouseDown={() => handlePressStart("forward")}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={() => handlePressStart("forward")}
          onTouchEnd={handlePressEnd}
          style={{ position: "absolute", right: 0, top: 0, width: "38%", height: "100%", zIndex: 20 }}
        />

        {/* top-right small indicators for volume/brightness */}
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 30, color: "#fff", display: "flex", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <VolumeUpIcon sx={{ fontSize: 18 }} />
            <div style={{ fontSize: 12 }}>{Math.round(volume * 100)}%</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Brightness6Icon sx={{ fontSize: 18 }} />
            <div style={{ fontSize: 12 }}>{Math.round((brightness - 0.4) / (1.4 - 0.4) * 100)}%</div>
          </div>
        </div>

        {/* bottom-left meta overlay */}
        <div style={{ position: "absolute", left: 14, bottom: 24, zIndex: 22, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
          <div style={{ fontWeight: 800 }}>{post.ownerName}</div>
          <div style={{ maxWidth: 260, fontSize: 13 }}>{post.caption}</div>
        </div>

        {/* center controls (play/pause) - shown when controls visible */}
        {showControls && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 28,
              pointerEvents: "none",
            }}
          >
            <div style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={togglePlay}>
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.9)" }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.95)" }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* progress bar overlay (click to seek) */}
      <div
        ref={progressRef}
        onClick={onSeek}
        style={{
          height: 8,
          background: "rgba(255,255,255,0.12)",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            height: "100%",
            background: "linear-gradient(90deg,#d4af37,#ffd477)",
            transition: "width 120ms linear",
          }}
        />
      </div>

      {/* small controls area (below) - visible when not hiding */}
      {showControls && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, background: "#fff" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div onClick={handleLikeClick} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <FavoriteIcon style={{ color: liked ? "red" : "#0b3d0b" }} />
              <div style={{ fontWeight: 700 }}>{likeCount}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ChatBubbleOutlineIcon />
              <div style={{ fontWeight: 700 }}>{post.comments || 0}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShareIcon />
              <div style={{ fontWeight: 700 }}>{post.shares || 0}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#444" }}>
              {new Date((currentTime || 0) * 1000).toISOString().substr(11, 8).replace(/^00:/, "")} /
              {duration ? new Date(duration * 1000).toISOString().substr(11, 8).replace(/^00:/, "") : "--:--"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <VolumeUpIcon sx={{ fontSize: 18 }} />
              <Brightness6Icon sx={{ fontSize: 18 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
